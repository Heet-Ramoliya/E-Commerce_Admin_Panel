import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import { FiImage } from "react-icons/fi";
import Button from "./Button";

const UploadWidget = ({ onUploadSuccess }) => {
  const cloudinaryRef = useRef();
  const widgetRef = useRef();
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (window.cloudinary) {
      cloudinaryRef.current = window.cloudinary;
      widgetRef.current = cloudinaryRef.current.createUploadWidget(
        {
          cloudName: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME,
          uploadPreset: "E-commerce-Admin-Panel-Category-Image",
          multiple: false,
          cropping: true,
          croppingShowBackButton: true,
          croppingValidateDimensions: true,
          showSkipCropButton: false,
        },
        (error, result) => {
          if (result.event === "upload-added") {
            setIsUploading(true);
          }
          if (!error && result && result.event === "success") {
            setIsUploading(false);
            toast.success("Image uploaded successfully.");
            onUploadSuccess(result.info.secure_url);
          } else if (error) {
            setIsUploading(false);
            toast.error("Image upload failed.");
            console.error(error);
          }
        }
      );
    } else {
      toast.error("Cloudinary widget not loaded.");
      console.error(
        "Cloudinary is not available. Ensure the script is included in index.html."
      );
    }
  }, [onUploadSuccess]);

  return (
    <Button
      variant="secondary"
      icon={FiImage}
      onClick={() => widgetRef.current?.open()}
      disabled={isUploading}
      className="hover:bg-primary-600 hover:text-white transition-colors"
    >
      {isUploading ? "Uploading..." : "Upload Image"}
    </Button>
  );
};

export default UploadWidget;
