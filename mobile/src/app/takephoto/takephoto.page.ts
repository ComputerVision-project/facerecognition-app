import { Component, OnInit } from '@angular/core';
import { Plugins } from '@capacitor/core';
import { CameraPreview, CameraPreviewOptions, CameraPreviewPictureOptions } from '@capacitor-community/camera-preview';

import '@capacitor-community/camera-preview'
import { Camera } from '@capacitor/camera';
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
      position: 'rear',
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
  
 
}
