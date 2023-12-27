import { Component } from '@angular/core';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
})
export class Tab1Page {
  imageData: string | ArrayBuffer | null = null;

  constructor() {}

  uploadPhoto() {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.onchange = (e: any) => {
      const file = e.target.files[0];
      this.previewPhoto(file);
    };
    fileInput.click();
  }

  previewPhoto(file: File) {
    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.imageData = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  confirmPhoto() {
    const images = JSON.parse(localStorage.getItem('confirmedImages') || '[]');
    images.push(this.imageData);
    localStorage.setItem('confirmedImages', JSON.stringify(images));
    this.resetUpload(); // Clear the current image after confirmation
  }
  

  resetUpload() {
    this.imageData = null;
  }

  
}
