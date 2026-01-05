-- Create storage buckets for logos and avatars
INSERT INTO storage.buckets (id, name, public) 
VALUES ('bookmaker-logos', 'bookmaker-logos', true);

INSERT INTO storage.buckets (id, name, public) 
VALUES ('analyst-avatars', 'analyst-avatars', true);

-- Create policies for bookmaker logos
CREATE POLICY "Bookmaker logos are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'bookmaker-logos');

CREATE POLICY "Admins can upload bookmaker logos" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'bookmaker-logos' AND has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update bookmaker logos" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'bookmaker-logos' AND has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete bookmaker logos" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'bookmaker-logos' AND has_role(auth.uid(), 'admin'));

-- Create policies for analyst avatars
CREATE POLICY "Analyst avatars are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'analyst-avatars');

CREATE POLICY "Admins can upload analyst avatars" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'analyst-avatars' AND has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update analyst avatars" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'analyst-avatars' AND has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete analyst avatars" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'analyst-avatars' AND has_role(auth.uid(), 'admin'));