// Cloudflare Worker for GitHub Release File Upload
// Deploy this to Cloudflare Workers

const FILE_LIMITS = {
  'image': { maxSize: 50 * 1024 * 1024, version: 'v1.0.0.0.0.0.0.1' }, // 50MB
  'video': { maxSize: 1024 * 1024 * 1024, version: 'v1.0.0.0.0.0.0.2' }, // 1GB
  'audio': { maxSize: 1024 * 1024 * 1024, version: 'v1.0.0.0.0.0.0.3' }, // 1GB
  'rar': { maxSize: 2 * 1024 * 1024 * 1024, version: 'v1.0.0.0.0.0.0.4' }, // 2GB
  'zip': { maxSize: 2 * 1024 * 1024 * 1024, version: 'v1.0.0.0.0.0.0.5' }, // 2GB
  'apk': { maxSize: 1.2 * 1024 * 1024 * 1024, version: 'v1.0.0.0.0.0.0.6' }, // 1.2GB
  'exe': { maxSize: 1.2 * 1024 * 1024 * 1024, version: 'v1.0.0.0.0.0.0.7' }, // 1.2GB
  'pdf': { maxSize: 500 * 1024 * 1024, version: 'v1.0.0.0.0.0.0.8' }, // 500MB
  'document': { maxSize: 500 * 1024 * 1024, version: 'v1.0.0.0.0.0.0.8' }, // 500MB
  'other': { maxSize: 500 * 1024 * 1024, version: 'v1.0.0.0.0.0.0.8' } // 500MB
};

const GITHUB_REPO = 'username/repo-name'; // Replace with your repo

export default {
  async fetch(request, env) {
    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    if (request.method !== 'POST') {
      return new Response('Method not allowed', { 
        status: 405, 
        headers: corsHeaders 
      });
    }

    try {
      const formData = await request.formData();
      const file = formData.get('file');
      const fileType = formData.get('fileType');
      const fileName = formData.get('fileName');

      if (!file || !fileType || !fileName) {
        return new Response(JSON.stringify({ 
          error: 'Missing required fields: file, fileType, fileName' 
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // Check file size limits
      const limit = FILE_LIMITS[fileType] || FILE_LIMITS['other'];
      if (file.size > limit.maxSize) {
        return new Response(JSON.stringify({ 
          error: `File too large. Maximum size for ${fileType} files is ${Math.round(limit.maxSize / (1024 * 1024))}MB` 
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // Upload to GitHub Release
      const uploadUrl = await uploadToGitHubRelease(file, fileName, fileType, env.GITHUB_TOKEN);
      
      return new Response(JSON.stringify({ 
        success: true, 
        url: uploadUrl,
        size: file.size,
        type: fileType
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });

    } catch (error) {
      console.error('Upload error:', error);
      return new Response(JSON.stringify({ 
        error: 'Upload failed: ' + error.message 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
  }
};

async function uploadToGitHubRelease(file, fileName, fileType, githubToken) {
  const limit = FILE_LIMITS[fileType] || FILE_LIMITS['other'];
  const version = limit.version;
  
  // Check if release exists, create if not
  let release = await getOrCreateRelease(version, githubToken);
  
  // Upload file to release
  const uploadUrl = `https://uploads.github.com/repos/${GITHUB_REPO}/releases/${release.id}/assets?name=${encodeURIComponent(fileName)}`;
  
  const uploadResponse = await fetch(uploadUrl, {
    method: 'POST',
    headers: {
      'Authorization': `token ${githubToken}`,
      'Content-Type': 'application/octet-stream',
      'User-Agent': 'Pixovia-Uploader'
    },
    body: file
  });

  if (!uploadResponse.ok) {
    const error = await uploadResponse.text();
    throw new Error(`GitHub upload failed: ${error}`);
  }

  const asset = await uploadResponse.json();
  return asset.browser_download_url;
}

async function getOrCreateRelease(version, githubToken) {
  // Try to get existing release
  const getReleaseUrl = `https://api.github.com/repos/${GITHUB_REPO}/releases/tags/${version}`;
  
  const getReleaseResponse = await fetch(getReleaseUrl, {
    headers: {
      'Authorization': `token ${githubToken}`,
      'User-Agent': 'Pixovia-Uploader'
    }
  });

  if (getReleaseResponse.ok) {
    return await getReleaseResponse.json();
  }

  // Create new release if it doesn't exist
  const createReleaseUrl = `https://api.github.com/repos/${GITHUB_REPO}/releases`;
  
  const createReleaseResponse = await fetch(createReleaseUrl, {
    method: 'POST',
    headers: {
      'Authorization': `token ${githubToken}`,
      'Content-Type': 'application/json',
      'User-Agent': 'Pixovia-Uploader'
    },
    body: JSON.stringify({
      tag_name: version,
      name: `Files Release ${version}`,
      body: `Automated release for file storage - ${version}`,
      draft: false,
      prerelease: false
    })
  });

  if (!createReleaseResponse.ok) {
    const error = await createReleaseResponse.text();
    throw new Error(`Failed to create release: ${error}`);
  }

  return await createReleaseResponse.json();
}
