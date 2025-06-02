-- imagesバケットを作成
INSERT INTO storage.buckets (id, name, public)
VALUES ('images', 'images', true);

-- 認証済みユーザーが画像をアップロードできるようにする
CREATE POLICY "認証済みユーザーは画像をアップロード可能"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'images');

-- 認証済みユーザーが自分の画像を削除できるようにする
CREATE POLICY "認証済みユーザーは自分の画像を削除可能"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- 誰でも画像を閲覧可能にする
CREATE POLICY "誰でも画像を閲覧可能"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'images'); 