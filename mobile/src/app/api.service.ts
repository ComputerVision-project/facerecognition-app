import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  private apiUrl = 'http://ec2-51-20-121-181.eu-north-1.compute.amazonaws.com:5000'; // Replace with your API URL

  constructor(private http: HttpClient) {}

  uploadImage(formData: FormData): Observable<any> {
    const uploadUrl = `${this.apiUrl}/upload`;
    return this.http.post(uploadUrl, formData);
  }

  downloadCSV(): Observable<Blob> {
    const downloadUrl = `${this.apiUrl}/download_csv`;
    return this.http.get(downloadUrl, { responseType: 'blob' });
  }
}
