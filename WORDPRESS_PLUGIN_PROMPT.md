# Prompt Completo para Criação de Plugin WordPress - Sistema de Picks de Apostas Esportivas

## CONTEXTO DO PROJETO

Você irá criar um plugin WordPress que se conecta a uma API REST de um sistema de picks de apostas esportivas. Este sistema está hospedado em Lovable Cloud (Supabase) e possui um esquema de dados completo para gerenciar eventos esportivos, análises de apostas e sistema multisite.

## OBJETIVO DO PLUGIN

Criar um plugin WordPress que permita aos administradores de sites WordPress:
1. Gerenciar conteúdo esportivo (eventos, picks, times, ligas)
2. Publicar conteúdo automaticamente em sites específicos do sistema multisite
3. Sincronizar dados entre WordPress e o backend Supabase
4. Oferecer widgets e shortcodes para exibir picks nos posts/páginas

## ARQUITETURA DO BACKEND (SUPABASE)

### Tabelas Principais

**1. sites** - Gerenciamento de multisites
- id (UUID, PK)
- name (TEXT) - Nome do site
- slug (TEXT, UNIQUE) - URL amigável
- domain (TEXT, UNIQUE) - Domínio customizado
- logo_url (TEXT)
- primary_color (TEXT)
- is_active (BOOLEAN)
- created_at, updated_at (TIMESTAMP)

**2. sports** - Esportes disponíveis
- id (UUID, PK)
- name (TEXT) - Ex: "Futebol", "Basquete"
- slug (TEXT, UNIQUE)
- icon (TEXT) - Emoji ou URL
- created_at, updated_at

**3. leagues** - Ligas/Competições
- id (UUID, PK)
- sport_id (UUID, FK → sports)
- site_id (UUID, FK → sites) - Relacionamento multisite
- name (TEXT)
- slug (TEXT, UNIQUE)
- country (TEXT)
- logo_url (TEXT)
- created_at, updated_at

**4. teams** - Times
- id (UUID, PK)
- league_id (UUID, FK → leagues)
- name (TEXT)
- slug (TEXT, UNIQUE)
- short_name (TEXT)
- logo_url (TEXT)
- external_api_id (TEXT) - ID de API externa (opcional)
- created_at, updated_at

**5. players** - Jogadores
- id (UUID, PK)
- team_id (UUID, FK → teams)
- name (TEXT)
- slug (TEXT, UNIQUE)
- position (TEXT)
- jersey_number (INTEGER)
- photo_url (TEXT)
- external_api_id (TEXT)
- created_at, updated_at

**6. events** - Eventos/Jogos
- id (UUID, PK)
- sport_id (UUID, FK → sports)
- league_id (UUID, FK → leagues)
- site_id (UUID, FK → sites) - Relacionamento multisite
- home_team_id (UUID, FK → teams)
- away_team_id (UUID, FK → teams)
- event_datetime (TIMESTAMP WITH TIME ZONE)
- venue (TEXT)
- status (TEXT) - 'scheduled', 'live', 'finished', 'cancelled'
- external_api_id (TEXT)
- created_at, updated_at

**7. bookmakers** - Casas de apostas
- id (UUID, PK)
- name (TEXT)
- slug (TEXT, UNIQUE)
- logo_url (TEXT)
- affiliate_link (TEXT) - Link de afiliado
- affiliate_params (JSONB) - Parâmetros personalizados
- is_active (BOOLEAN)
- created_at, updated_at

**8. market_types** - Tipos de mercado de apostas
- id (UUID, PK)
- sport_id (UUID, FK → sports)
- name (TEXT) - Ex: "Resultado Final", "Ambas Marcam", "Total de Pontos"
- slug (TEXT, UNIQUE)
- created_at

**9. picks** - Análises/Picks de apostas
- id (UUID, PK)
- event_id (UUID, FK → events)
- analyst_id (UUID, FK → analyst_profiles)
- site_id (UUID, FK → sites) - Relacionamento multisite
- market_type_id (UUID, FK → market_types)
- related_player_id (UUID, FK → players) - Opcional
- related_team_id (UUID, FK → teams) - Opcional
- selection (TEXT) - A escolha (ex: "Flamengo vence", "Mais de 2.5 gols")
- odds (NUMERIC) - Cotação
- odds_format (ENUM) - 'decimal', 'american', 'fractional'
- bookmaker_id (UUID, FK → bookmakers)
- pick_type (ENUM) - 'manual', 'ai_generated'
- confidence_level (INTEGER) - 1-5
- analysis (TEXT) - Análise detalhada
- is_best_odds (BOOLEAN)
- status (TEXT) - 'pending', 'won', 'lost', 'void'
- result (TEXT)
- created_at, updated_at

**10. analyst_profiles** - Perfis de analistas
- id (UUID, PK)
- user_id (UUID, FK → auth.users)
- display_name (TEXT)
- bio (TEXT)
- avatar_url (TEXT)
- twitter_handle (TEXT)
- website (TEXT)
- total_picks (INTEGER)
- win_rate (NUMERIC)
- created_at, updated_at

**11. user_roles** - Sistema de permissões
- id (UUID, PK)
- user_id (UUID, FK → auth.users)
- role (ENUM) - 'admin', 'analyst', 'user'
- created_at

### Enums
- app_role: 'admin', 'analyst', 'user'
- pick_type: 'manual', 'ai_generated'
- odds_format: 'decimal', 'american', 'fractional'

## API ENDPOINTS NECESSÁRIOS

Você precisará criar Edge Functions (Supabase Functions) para:

### 1. **GET /api/sites** - Listar sites
Retorna todos os sites ativos

### 2. **GET /api/sports** - Listar esportes
Retorna todos os esportes disponíveis

### 3. **POST /api/leagues** - Criar liga
Body: { sport_id, site_id, name, slug, country, logo_url }

### 4. **POST /api/teams** - Criar time
Body: { league_id, name, slug, short_name, logo_url }

### 5. **POST /api/events** - Criar evento
Body: { sport_id, league_id, site_id, home_team_id, away_team_id, event_datetime, venue }

### 6. **POST /api/picks** - Criar pick
Body: { event_id, analyst_id, site_id, market_type_id, selection, odds, bookmaker_id, analysis, confidence_level }

### 7. **GET /api/events?site_id={id}** - Listar eventos por site
Retorna eventos filtrados por site_id

### 8. **GET /api/picks?event_id={id}** - Listar picks por evento

## ESTRUTURA DO PLUGIN WORDPRESS

### Nome do Plugin
`wp-sports-picks-manager`

### Estrutura de Pastas
```
wp-sports-picks-manager/
├── wp-sports-picks-manager.php (arquivo principal)
├── includes/
│   ├── class-api-client.php (conexão com API)
│   ├── class-admin-menu.php (menus admin)
│   ├── class-sites-manager.php
│   ├── class-events-manager.php
│   ├── class-picks-manager.php
│   └── class-sync-manager.php (sincronização)
├── admin/
│   ├── views/
│   │   ├── sites-list.php
│   │   ├── events-create.php
│   │   ├── picks-create.php
│   │   └── settings.php
│   └── assets/
│       ├── css/admin-styles.css
│       └── js/admin-scripts.js
├── public/
│   ├── shortcodes/
│   │   ├── picks-list.php
│   │   └── event-card.php
│   └── widgets/
│       └── class-picks-widget.php
└── languages/
```

## FUNCIONALIDADES PRINCIPAIS

### 1. Configuração Inicial
- Campo para URL da API Supabase
- Campo para API Key (Supabase Anon Key)
- Seleção do site padrão (dropdown carregado da API)

### 2. Gerenciamento de Eventos
**Formulário para criar evento:**
- Seletor de esporte (carregado via API)
- Seletor de liga (carregado via API, filtrado por esporte)
- Seletor de site de destino
- Seletor de time mandante (carregado via API, filtrado por liga)
- Seletor de time visitante
- Data e hora do evento (datetime picker)
- Local do evento (texto)
- Botão "Criar Evento"

**Lista de eventos:**
- Tabela mostrando eventos criados
- Filtros: esporte, liga, site, status
- Ações: editar, deletar, ver picks

### 3. Gerenciamento de Picks
**Formulário para criar pick:**
- Seletor de evento (dropdown com eventos futuros)
- Seletor de tipo de mercado (carregado via API)
- Campo de seleção (texto livre)
- Campo de odds (numérico)
- Formato de odds (dropdown: decimal, americano, fracionário)
- Seletor de bookmaker
- Análise (editor de texto rico)
- Nível de confiança (slider 1-5)
- Site de destino (múltipla escolha - permitir publicar em vários sites)
- Botão "Publicar Pick"

**Lista de picks:**
- Tabela mostrando picks criados
- Colunas: Evento, Mercado, Seleção, Odds, Bookmaker, Confiança, Sites, Status
- Filtros: evento, site, status, data
- Ações: editar, deletar, duplicar

### 4. Shortcodes

**[sports_picks]**
Atributos:
- site_id (opcional) - filtrar por site
- sport (opcional) - filtrar por esporte
- limit (opcional) - número de picks
- layout (opcional) - 'list', 'grid', 'cards'

Exemplo:
```
[sports_picks site_id="uuid-do-site" sport="futebol" limit="10" layout="grid"]
```

**[event_card]**
Atributos:
- event_id (obrigatório)
- show_picks (opcional, default: true)

Exemplo:
```
[event_card event_id="uuid-do-evento" show_picks="true"]
```

**[picks_by_analyst]**
Atributos:
- analyst_id (obrigatório)
- limit (opcional)

### 5. Widgets

**Widget "Próximos Picks"**
Configuração:
- Título do widget
- Site (dropdown)
- Esporte (dropdown)
- Número de picks
- Layout

### 6. Sincronização

**Sincronização automática:**
- Cronjob WordPress que roda a cada hora
- Busca novos eventos da API
- Atualiza status de eventos (agendado → ao vivo → finalizado)
- Atualiza resultados de picks (pendente → ganho/perdido)

**Sincronização manual:**
- Botão "Sincronizar Agora" no painel admin
- Mostra log de sincronização

## SEGURANÇA

### Autenticação na API
```php
// Headers obrigatórios para todas as requisições
$headers = [
    'apikey' => get_option('spm_supabase_anon_key'),
    'Authorization' => 'Bearer ' . get_option('spm_supabase_anon_key'),
    'Content-Type' => 'application/json'
];
```

### Sanitização
- Sanitizar todos os inputs usando funções WordPress (sanitize_text_field, wp_kses_post)
- Usar prepared statements para queries no WordPress
- Validar UUIDs antes de enviar para API

### Permissions
- Capability 'manage_options' para acessar configurações
- Capability customizada 'manage_sports_picks' para gerenciar conteúdo
- Nonces em todos os formulários

## INTERFACE DO USUÁRIO

### Menu Admin
```
Sports Picks
├── Dashboard (visão geral, estatísticas)
├── Eventos
│   ├── Todos os Eventos
│   └── Criar Novo
├── Picks
│   ├── Todos os Picks
│   └── Criar Novo
├── Sincronização
│   ├── Logs
│   └── Configurar
└── Configurações
    ├── API Settings
    ├── Site Padrão
    └── Bookmakers
```

### Design
- Usar estilos nativos do WordPress (wp-admin)
- Componentes responsivos
- Feedback visual (loading spinners, mensagens de sucesso/erro)
- Uso de cores da interface admin do WordPress

## EXEMPLO DE CÓDIGO - Cliente API

```php
<?php
class SPM_API_Client {
    private $api_url;
    private $api_key;

    public function __construct() {
        $this->api_url = get_option('spm_api_url');
        $this->api_key = get_option('spm_api_key');
    }

    private function get_headers() {
        return [
            'apikey' => $this->api_key,
            'Authorization' => 'Bearer ' . $this->api_key,
            'Content-Type' => 'application/json'
        ];
    }

    public function get_sites() {
        $response = wp_remote_get(
            $this->api_url . '/rest/v1/sites?is_active=eq.true',
            ['headers' => $this->get_headers()]
        );

        if (is_wp_error($response)) {
            return [];
        }

        return json_decode(wp_remote_retrieve_body($response), true);
    }

    public function create_event($data) {
        $response = wp_remote_post(
            $this->api_url . '/rest/v1/events',
            [
                'headers' => $this->get_headers(),
                'body' => json_encode($data)
            ]
        );

        if (is_wp_error($response)) {
            return ['error' => $response->get_error_message()];
        }

        return json_decode(wp_remote_retrieve_body($response), true);
    }

    public function create_pick($data) {
        $response = wp_remote_post(
            $this->api_url . '/rest/v1/picks',
            [
                'headers' => $this->get_headers(),
                'body' => json_encode($data),
                'method' => 'POST'
            ]
        );

        if (is_wp_error($response)) {
            return ['error' => $response->get_error_message()];
        }

        $code = wp_remote_retrieve_response_code($response);
        if ($code !== 201) {
            return ['error' => 'Failed to create pick'];
        }

        return json_decode(wp_remote_retrieve_body($response), true);
    }

    public function get_events($filters = []) {
        $query_params = [];
        
        if (isset($filters['site_id'])) {
            $query_params[] = 'site_id=eq.' . $filters['site_id'];
        }
        
        if (isset($filters['sport_id'])) {
            $query_params[] = 'sport_id=eq.' . $filters['sport_id'];
        }

        if (isset($filters['from_date'])) {
            $query_params[] = 'event_datetime=gte.' . $filters['from_date'];
        }

        $query_string = !empty($query_params) ? '?' . implode('&', $query_params) : '';
        
        $response = wp_remote_get(
            $this->api_url . '/rest/v1/events' . $query_string . '&select=*,home_team:teams!events_home_team_id_fkey(*),away_team:teams!events_away_team_id_fkey(*),league:leagues(*),sport:sports(*)',
            ['headers' => $this->get_headers()]
        );

        if (is_wp_error($response)) {
            return [];
        }

        return json_decode(wp_remote_retrieve_body($response), true);
    }
}
```

## EXEMPLO DE SHORTCODE

```php
<?php
function spm_sports_picks_shortcode($atts) {
    $atts = shortcode_atts([
        'site_id' => '',
        'sport' => '',
        'limit' => 10,
        'layout' => 'grid'
    ], $atts);

    $api = new SPM_API_Client();
    
    $filters = [];
    if (!empty($atts['site_id'])) {
        $filters['site_id'] = $atts['site_id'];
    }
    
    $events = $api->get_events($filters);
    
    ob_start();
    ?>
    <div class="spm-picks-container layout-<?php echo esc_attr($atts['layout']); ?>">
        <?php foreach ($events as $event): ?>
            <div class="spm-event-card">
                <div class="event-header">
                    <span class="sport-badge"><?php echo esc_html($event['sport']['name']); ?></span>
                    <span class="league-name"><?php echo esc_html($event['league']['name']); ?></span>
                </div>
                <div class="event-teams">
                    <span class="home-team"><?php echo esc_html($event['home_team']['name']); ?></span>
                    <span class="vs">@</span>
                    <span class="away-team"><?php echo esc_html($event['away_team']['name']); ?></span>
                </div>
                <div class="event-datetime">
                    <?php echo date_i18n('d/m/Y H:i', strtotime($event['event_datetime'])); ?>
                </div>
                <?php
                // Buscar picks para este evento
                $picks = $api->get_picks(['event_id' => $event['id']]);
                if (!empty($picks)):
                ?>
                    <div class="picks-list">
                        <?php foreach ($picks as $pick): ?>
                            <div class="pick-card">
                                <strong><?php echo esc_html($pick['market_type']['name']); ?></strong>
                                <p class="selection"><?php echo esc_html($pick['selection']); ?></p>
                                <div class="odds-box">
                                    <span class="odds"><?php echo esc_html($pick['odds']); ?></span>
                                    <span class="bookmaker"><?php echo esc_html($pick['bookmaker']['name']); ?></span>
                                </div>
                                <?php if ($pick['analysis']): ?>
                                    <details class="analysis">
                                        <summary>Ver Análise</summary>
                                        <p><?php echo wp_kses_post($pick['analysis']); ?></p>
                                    </details>
                                <?php endif; ?>
                            </div>
                        <?php endforeach; ?>
                    </div>
                <?php endif; ?>
            </div>
        <?php endforeach; ?>
    </div>
    <?php
    return ob_get_clean();
}
add_shortcode('sports_picks', 'spm_sports_picks_shortcode');
```

## MELHORIAS FUTURAS

1. **Cache de dados**
   - Usar Transients API do WordPress
   - Cache de 5 minutos para listas de esportes, ligas, times
   - Invalidar cache quando criar/editar

2. **Importação em massa**
   - Upload de CSV para criar múltiplos eventos
   - Template de CSV para download

3. **Integração com Gutenberg**
   - Blocos customizados para picks
   - Preview ao vivo no editor

4. **Analytics**
   - Dashboard com estatísticas de performance
   - Taxa de acerto de picks
   - Bookmakers mais usados

5. **Notificações**
   - Email quando pick é publicado
   - Webhook quando evento termina

## CONFIGURAÇÃO FINAL

### Supabase URL e Keys
A URL da API Supabase segue o formato:
```
https://[PROJECT_ID].supabase.co
```

### Endpoints Supabase REST API
```
GET    /rest/v1/[table_name]
POST   /rest/v1/[table_name]
PATCH  /rest/v1/[table_name]?id=eq.[uuid]
DELETE /rest/v1/[table_name]?id=eq.[uuid]
```

### Headers obrigatórios
```
apikey: [SUPABASE_ANON_KEY]
Authorization: Bearer [SUPABASE_ANON_KEY]
Content-Type: application/json
```

## INSTRUÇÕES FINAIS PARA A IA

1. Crie um plugin WordPress completo e funcional
2. Siga as convenções de código WordPress (WordPress Coding Standards)
3. Use funções nativas do WordPress sempre que possível
4. Implemente validação e sanitização rigorosa
5. Adicione comentários explicativos no código
6. Crie um README.md com instruções de instalação
7. Inclua um arquivo de changelog (CHANGELOG.md)
8. Prepare o plugin para internacionalização (i18n)
9. Teste todas as funcionalidades antes de entregar

## RESULTADO ESPERADO

Um plugin WordPress pronto para ser instalado que permita aos administradores gerenciarem todo o conteúdo de picks esportivos diretamente do WordPress, publicando automaticamente nos sites multisite do sistema Lovable/Supabase.

---

**Versão:** 1.0  
**Data:** 2025  
**Compatibilidade:** WordPress 6.0+, PHP 7.4+
