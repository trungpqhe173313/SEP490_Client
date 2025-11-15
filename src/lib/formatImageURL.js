export const formatImageURL = (url) => {
    if (typeof url === 'string') {
        return `${process.env.NEXT_PUBLIC_CLOUDINARY_LINK}${url}`;
    }
    return URL.createObjectURL(url);
};