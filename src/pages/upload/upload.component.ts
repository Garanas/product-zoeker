// src/pages/upload/upload.component.ts
import { Component, signal } from '@angular/core';
import { CsvService } from '../../services/DataService';
import { SearchComponent } from '../search/search.component';
import { NgClass } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-csv-uploader',
  standalone: true,
  imports: [SearchComponent, ReactiveFormsModule, NgClass],
  template: `
    <div class="max-w-4xl mx-auto p-6">
      <!-- Integrated file input and clear button -->
      <form [formGroup]="uploadForm" class="mb-6">
        <div class="flex">
          <div class="relative flex-grow">
            <label for="file-upload"
                   class="w-full flex items-center px-4 py-2 border border-gray-300 rounded-l-md text-gray-700 bg-white cursor-pointer hover:bg-gray-50">
              <span class="material-icons mr-2 text-gray-500">file_open</span>
              <span class="truncate">
                {{ getFileName() || 'Open een CSV bestand...' }}
              </span>
            </label>
            <input
              id="file-upload"
              type="file"
              accept=".csv"
              formControlName="fileInput"
              (change)="onFileSelected($event)"
              class="hidden"
            >
          </div>

          <!-- Clear data button or browse button depending on state -->
          <button
            type="button"
            (click)="dataLoaded() ? clearData() : triggerFileBrowser()"
            class="px-4 py-2 flex items-center justify-center rounded-r-md transition-colors"
            [ngClass]="dataLoaded() ? 'bg-red-500 hover:bg-red-600 text-white' : 'bg-blue-500 hover:bg-blue-600 text-white'"
          >
            <span class="material-icons">{{ dataLoaded() ? 'delete' : 'search' }}</span>
            <span class="ml-1 hidden sm:inline">{{ dataLoaded() ? 'Clear Data' : 'Browse' }}</span>
          </button>
        </div>
      </form>

      @if (dataLoaded()) {
        <app-search></app-search>
      } @else {
        <div class="text-center p-8 bg-gray-50 rounded-md border border-gray-200 text-gray-600">
          Laad een csv-bestand in om te zoeken naar producten...
        </div>
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

  triggerFileBrowser(): void {
    // Programmatically click the hidden file input
    document.getElementById('file-upload')?.click();
  }

  getFileName(): string {
    const input = document.getElementById('file-upload') as HTMLInputElement;
    if (input && input.files && input.files.length > 0) {
      return input.files[0].name;
    }
    return '';
  }
}
