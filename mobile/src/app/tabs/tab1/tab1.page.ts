import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Filesystem, Directory } from '@capacitor/filesystem';


@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
})
export class Tab1Page {
  imagePreview: any = '';
  imageFile: File | undefined; 
  processedImage:any ='';
  downloadLinkAvailable: boolean = false;

  constructor(private http: HttpClient){}

  onFileSelected(event: any) {
    const file: File = event.target.files[0];

    if (file) {
      this.imageFile = file; // Save the file object

      const reader = new FileReader();
      reader.onload = e => this.imagePreview = reader.result;
      reader.readAsDataURL(file);
    }
  }

  uploadImage() {
    if (this.imageFile) {
      const formData = new FormData();
      formData.append('file', this.imageFile); 

      this.http.post('http://localhost:5000/upload', formData).subscribe(
        (response:any) => {
          console.log('Upload successful', response);
          this.processedImage = 'data:image/jpeg;base64,' + response.image;
          this.downloadLinkAvailable = true;
        },
        (error) => {
          console.error('Upload failed', error);
        }
      );
    } else {
      console.error('No file selected');
    }
  }

  
  async downloadCSV() {
    const url = 'http://localhost:5000/download_csv';
  
    try {
      const response = await this.http.get(url, { responseType: 'blob' }).toPromise();
  
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
    } catch (e) {
      console.error('Unable to download file', e);
    }
  }
  


  reset(){
    this.imagePreview= '';
    this.imageFile=undefined;
    this.processedImage='';
  }
}
