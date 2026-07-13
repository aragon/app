const kiloByte = 1024;
const megaByte = 1024 * 1024;

export const formatFileSize = (bytes: number): string => {
    if (bytes >= megaByte) {
        return `${(bytes / megaByte).toFixed(1)} MB`;
    }

    if (bytes >= kiloByte) {
        return `${Math.round(bytes / kiloByte)} KB`;
    }

    return `${bytes} B`;
};
