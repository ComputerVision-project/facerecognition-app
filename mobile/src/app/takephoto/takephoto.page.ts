import { Component, OnInit } from '@angular/core';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { ApiService } from '../api.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-takephoto',
  templateUrl: './takephoto.page.html',
  styleUrls: ['./takephoto.page.scss'],
})
export class TakephotoPage {
  image: any = null;
  processedImage: any = '';
  downloadLinkAvailable: boolean = false;

  constructor(private api: ApiService, private router: Router) {}

  ionViewWillEnter() {
    this.captureImage();
  }

  async captureImage() {
    try {
      const capturedImage = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.Uri,
        source: CameraSource.Camera
      });

      // Convert the image to the format you need (base64, blob, etc)
      this.image = capturedImage.webPath;
    } catch (e) {
      console.error('Error capturing image', e);
    }
  }

  async uploadImage() {
    if (this.image) {
      try {
        const file = await this.uriToFile(this.image, 'capturedImage.jpg');
        const formData = new FormData();
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
      } catch (error) {
        console.error('Error converting URI to file', error);
      }
    } else {
      console.error('No image captured');
    }
  }
  

  async downloadCSV() {
    this.api.downloadCSV().subscribe(
      (response: Blob) => {
        const blobUrl = window.URL.createObjectURL(response);
        const a = document.createElement('a');
        a.href = blobUrl;
        a.download = 'attendance.csv';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(blobUrl);
        a.remove();
      },
      (error) => {
        console.error('Download failed', error);
      }
    );
  }
  private async uriToFile(uri: string, filename: string): Promise<File> {
    const response = await fetch(uri);
    const blob = await response.blob();
    return new File([blob], filename, { type: 'image/jpeg' });
  }
  

  reset() {
    this.image = null;
    this.processedImage = '';
    this.router.navigate(['modes']);
  }
}
