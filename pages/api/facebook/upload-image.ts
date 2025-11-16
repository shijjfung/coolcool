import type { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
import { promises as fs } from 'fs';
import path from 'path';
import { supabaseAdmin } from '@/lib/supabase';

const BUCKET_NAME = process.env.SUPABASE_FACEBOOK_BUCKET || 'facebook-post-images';

export const config = {
  api: {
    bodyParser: false,
  },
};

let bucketChecked = false;

async function ensureBucketExists() {
  if (bucketChecked || !supabaseAdmin) return;
  try {
    const { data, error } = await supabaseAdmin.storage.getBucket(BUCKET_NAME);
    if (error && error.message?.toLowerCase().includes('not found')) {
      const { error: createError } = await supabaseAdmin.storage.createBucket(BUCKET_NAME, {
        public: true,
      });
      if (createError && createError.message?.includes('already exists')) {
        bucketChecked = true;
        return;
      }
      if (createError) throw createError;
    } else if (error) {
      throw error;
    }
    bucketChecked = true;
  } catch (err) {
    console.error('[upload-image] bucket check error:', err);
    throw err;
  }
}

async function parseForm(req: NextApiRequest) {
  const form = formidable({
    multiples: false,
    maxFiles: 1,
    keepExtensions: true,
    maxFileSize: 10 * 1024 * 1024, // 10MB
  });

  return await new Promise<{ fields: formidable.Fields; files: formidable.Files }>((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) reject(err);
      else resolve({ fields, files });
    });
  });
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!supabaseAdmin) {
    return res.status(500).json({ error: 'Supabase 尚未正確設定' });
  }

  try {
    await ensureBucketExists();
  } catch (error: any) {
    return res.status(500).json({ error: error?.message || '初始化儲存空間失敗' });
  }

  try {
    const { files } = await parseForm(req);
    const incomingFile = files.file || files.image || files.images;
    const uploadedFile = Array.isArray(incomingFile) ? incomingFile[0] : incomingFile;

    if (!uploadedFile) {
      return res.status(400).json({ error: '請選擇要上傳的圖片' });
    }

    const filepath = uploadedFile.filepath;
    const originalName = uploadedFile.originalFilename || uploadedFile.newFilename || 'image';
    const buffer = await fs.readFile(filepath);
    const ext = path.extname(originalName) || '.jpg';
    const objectKey = `uploads/${Date.now()}-${Math.random().toString(36).substring(2)}${ext}`;

    const uploadResult = await supabaseAdmin.storage
      .from(BUCKET_NAME)
      .upload(objectKey, buffer, {
        contentType: uploadedFile.mimetype || 'application/octet-stream',
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadResult.error) {
      return res.status(500).json({ error: uploadResult.error.message || '上傳失敗' });
    }

    const { data } = supabaseAdmin.storage.from(BUCKET_NAME).getPublicUrl(objectKey);

    return res.status(200).json({
      success: true,
      url: data.publicUrl,
      path: objectKey,
    });
  } catch (error: any) {
    console.error('[upload-image] error:', error);
    return res.status(500).json({
      error: error?.message || '上傳圖片時發生錯誤',
    });
  }
}

