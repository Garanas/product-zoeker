import { Component, signal } from '@angular/core';
import { CsvService } from '../../services/DataService';
import { SearchComponent } from '../search/search.component';
import { JsonPipe, KeyValuePipe } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-csv-uploader',
  standalone: true,
  imports: [SearchComponent, ReactiveFormsModule],
  template: `
    <div class="max-w-4xl mx-auto p-6">
      <h1 class="text-2xl font-bold text-center mb-8 text-gray-800">Barcode mapper</h1>

      <form [formGroup]="uploadForm" class="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
        <input
          type="file"
          accept=".csv"
          formControlName="fileInput"
          (change)="onFileSelected($event)"
          class="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700"
        >

        @if(dataLoaded()) {
          <button
            type="button"
            (click)="clearData()"
            class="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-md transition-colors"
          >
            Clear Data
          </button>
        }
      </form>

      @if (dataLoaded()) {
        <app-search></app-search>
      }

      @if (errorMessage()) {
        <div class="mt-6 px-4 py-3 bg-red-50 text-red-700 border border-red-200 rounded-md">
          {{ errorMessage() }}
        </div>
      }
    </div>
  `
})
export class CsvUploaderComponent {
  dataLoaded = signal(false);
  errorMessage = signal('');
  uploadForm: FormGroup;

  constructor(
    private csvService: CsvService,
    private fb: FormBuilder
  ) {
    this.uploadForm = this.fb.group({
      fileInput: ['']
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.errorMessage.set('');

      this.csvService.parseCSV(input.files[0]).subscribe({
        next: (data) => {
          console.log('CSV parsed successfully', data);
          this.dataLoaded.set(true);
        },
        error: (err) => {
          console.error('Error parsing CSV', err);
          this.errorMessage.set('Error parsing CSV file: ' + err.message);
          this.dataLoaded.set(false);
        }
      });
    }
  }

  clearData(): void {
    this.csvService.clearData();
    this.dataLoaded.set(false);

    // Reset the form to clear the file input
    this.uploadForm.reset();

    console.log('Data cleared');
  }
}
