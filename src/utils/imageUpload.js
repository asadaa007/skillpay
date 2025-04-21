/**
 * Uploads an image to ImgBB and returns the URL
 * @param {File} imageFile - The image file to upload
 * @returns {Promise<string>} - The URL of the uploaded image
 */
export const uploadImageToImgBB = async (imageFile) => {
  try {
    // Create form data
    const formData = new FormData();
    formData.append('image', imageFile);
    
    // Get API key from environment variables
    const apiKey = import.meta.env.VITE_IMGBB_API_KEY;
    
    // Upload to ImgBB
    const response = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
      method: 'POST',
      body: formData
    });
    
    if (!response.ok) {
      throw new Error(`ImgBB API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.success && data.data && data.data.url) {
      return data.data.url;
    } else {
      throw new Error('ImgBB response missing URL');
    }
  } catch (error) {
    console.error('Error uploading image to ImgBB:', error);
    throw error;
  }
}; 