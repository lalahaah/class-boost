import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage } from './firebase';

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

export const StorageService = {
    // 파일 업로드 (디자인 원본 및 관리자 시안)
    async uploadFile(file, path = 'uploads', onProgress) {
        return new Promise((resolve, reject) => {
            if (!file) {
                reject('No file provided');
                return;
            }

            // 파일 크기 검증
            if (file.size > MAX_FILE_SIZE) {
                reject(`파일 크기가 50MB를 초과했습니다. (${(file.size / (1024 * 1024)).toFixed(1)}MB)`);
                return;
            }

            const fileName = `${Date.now()}_${file.name}`;
            const storageRef = ref(storage, `${path}/${fileName}`);

            const uploadTask = uploadBytesResumable(storageRef, file);

            uploadTask.on(
                'state_changed',
                (snapshot) => {
                    const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                    if (onProgress) onProgress(progress);
                },
                (error) => {
                    console.error("Storage upload error:", error);
                    reject(error);
                },
                async () => {
                    const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                    resolve(downloadURL);
                }
            );
        });
    }
};
