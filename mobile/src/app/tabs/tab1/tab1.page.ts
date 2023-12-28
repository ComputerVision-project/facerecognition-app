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
  const response = await this.http.get(url, { responseType: 'blob' }).toPromise();

  const data = await new Response(response).arrayBuffer();
  const fileName = 'attendance.csv';

  try {
    const result = await Filesystem.writeFile({
      path: fileName,
      data: btoa(new Uint8Array(data).reduce((data, byte) => data + String.fromCharCode(byte), '')),
      directory: Directory.Documents
      // encoding: 'base64'
    });

    console.log('File written to', result.uri);
    
    // Optionally, open the file here if needed
  } catch (e) {
    console.error('Unable to write file', e);
  }
}

  reset(){
    this.imagePreview= '';
    this.imageFile=undefined;
    this.processedImage='';
  }
}
