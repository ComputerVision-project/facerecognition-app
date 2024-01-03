import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ApiService } from '../api.service';

@Component({
  selector: 'app-upload',
  templateUrl: './upload.page.html',
  styleUrls: ['./upload.page.scss'],
})
export class UploadPage {
  imagePreview: any = '';
  imageFile: File | undefined; 
  processedImage:any ='';
  downloadLinkAvailable: boolean = false;

  constructor(private http: HttpClient, private api:ApiService){}

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
      console.error('No file selected');
    }
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
    this.imagePreview= '';
    this.imageFile=undefined;
    this.processedImage='';
  }


}
