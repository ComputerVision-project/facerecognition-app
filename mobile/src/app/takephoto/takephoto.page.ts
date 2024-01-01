import { Component, OnInit } from '@angular/core';
import { CameraPreview, CameraPreviewOptions, CameraPreviewPictureOptions } from '@capacitor-community/camera-preview';

import '@capacitor-community/camera-preview'
import { ApiService } from '../api.service';

@Component({
  selector: 'app-takephoto',
  templateUrl: './takephoto.page.html',
  styleUrls: ['./takephoto.page.scss'],
})
export class TakephotoPage implements OnInit {
  image :any = null;
  cameraActive = false;
  torchActive = false;
  processedImage: any = '';
  downloadLinkAvailable: boolean = false;
  
  constructor(private api:ApiService) {
    this.openCamera();
  }
  ngOnInit(): void {
    this.openCamera();  
  }

  openCamera() {
    const cameraPreviewOptions: CameraPreviewOptions = {
      position: 'front',
      parent: 'cameraPreview',
      className: 'cameraPreview'
    };
    CameraPreview.start(cameraPreviewOptions);
    this.cameraActive = true;
  }

  async stopCamera(){
    await CameraPreview.stop();
    this.cameraActive = false;
  }
  async captureImage(){
    const cameraPreviewOptions: CameraPreviewPictureOptions={
      quality: 90
    };

    const result = await CameraPreview.capture(cameraPreviewOptions);
    this.image = `data:image/jpeg;base64,${result.value}`;
    this.stopCamera();
  }

  uploadImage() {
    if (this.image) {
      const formData = new FormData();
      // Convert base64 image to File object
      const file = this.base64toFile(this.image, 'capturedImage.jpg');
      formData.append('file', file);
  
      this.api.uploadImage(formData).subscribe(
        (response: any) => {
          console.log('Upload successful', response);
          this.processedImage = 'data:image/jpeg;base64,' + response.image;
          this.downloadLinkAvailable = true;
        },
        (error) => {
          console.error('Upload failed', error);
        }
      );
    } else {
      console.error('No image captured');
    }
  }
  
  private base64toFile(base64String: string, filename: string): File {
    const arr = base64String.split(',');
    const mime = arr[0].match(/:(.*?);/)![1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
  
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
  
    return new File([u8arr], filename, { type: mime });
  }
  async downloadCSV() {
    this.api.downloadCSV().subscribe(
      (response: Blob) => {
        
      // Check if the response is a Blob
      if (response instanceof Blob) {
        // Create a blob URL link
        const blobUrl = window.URL.createObjectURL(response);
  
        // Create an anchor element and set the href to the blob URL
        const a = document.createElement('a');
        a.href = blobUrl;
        a.download = 'attendance.csv';  // File name for download
        document.body.appendChild(a);  // Append to the document
  
        a.click();  // Trigger the download
  
        window.URL.revokeObjectURL(blobUrl);  // Clean up
        a.remove();  // Remove the element
      } else {
        console.error('Response is not a blob:', response);
      }
      },
      (error) => {
        console.error('Download failed', error);
      }
    );
  }

  reset(){
    this.image= null;
    this.processedImage='';
    this.openCamera();

  }
  
 
}
