// import axios from "axios";

// export const uploadToCloudinary = async (file: File) => {
//     const formData = new FormData();
//     formData.append("file", file);
//     formData.append("upload_preset", "my_preset_shoca"); // Tạo trong Cloudinary
//     formData.append("cloud_name", "dqnxnuqv5");

//     try {
//         const response = await axios.post(
//             `https://api.cloudinary.com/v1_1/dqnxnuqv5/image/upload`,
//             formData
//         );
//         console.log("response.data.secure_url: ", response.data.secure_url)
//         return response.data.secure_url; // URL ảnh sau khi upload
//     } catch (error) {
//         console.error("Upload failed:", error);
//         return null;
//     }
// };