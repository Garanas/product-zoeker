// src/services/BarcodeDetectionService.ts
import { ElementRef, Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BarcodeDetectionService {
  private isBarcodeDetectionSupported: boolean;
  private scannerActive = false;
  private videoElement: HTMLVideoElement | null = null;
  private detector: any = null;
  private barcodeSubject = new Subject<string>();
  private mediaStream: MediaStream | null = null;

  constructor() {
    // Check if the Barcode Detection API is supported
    this.isBarcodeDetectionSupported = 'BarcodeDetector' in window;

    // Initialize the detector if supported
    if (this.isBarcodeDetectionSupported) {
      this.detector = new (window as any).BarcodeDetector({
        formats: ['code_39', 'code_128', 'ean_13', 'ean_8', 'upc_a', 'upc_e', 'qr_code']
      });
    }
  }

  /**
   * Checks if the Barcode Detection API is supported in the current browser
   * @returns boolean indicating whether the API is supported
   */
  isSupported(): boolean {
    return this.isBarcodeDetectionSupported;
  }

  /**
   * Start scanning for barcodes using device camera
   * @param videoElementRef Reference to a video element to display the camera feed
   * @returns Observable that emits barcode values when detected
   */
  startScanning(videoElementRef: ElementRef<HTMLVideoElement>): Observable<string> {
    if (!this.isBarcodeDetectionSupported) {
      this.barcodeSubject.error(new Error('Barcode Detection API is not supported in this browser'));
      return this.barcodeSubject.asObservable();
    }

    if (this.scannerActive) {
      return this.barcodeSubject.asObservable();
    }

    this.scannerActive = true;

    // Store reference to the provided video element
    this.videoElement = videoElementRef.nativeElement;

    // Get user media (camera)
    navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: 'environment', // Use back camera if available
        width: { ideal: 1280 },
        height: { ideal: 720 }
      }
    })
      .then(stream => {
        this.mediaStream = stream;

        if (this.videoElement) {
          this.videoElement.srcObject = stream;
          this.videoElement.play();

          // Start detection loop
          this.detectBarcodes();
        }
      })
      .catch(error => {
        this.scannerActive = false;
        this.barcodeSubject.error(error);
      });

    return this.barcodeSubject.asObservable();
  }

  /**
   * Stop the barcode scanning process
   */
  stopScanning(): void {
    this.scannerActive = false;

    // Stop media stream
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => track.stop());
      this.mediaStream = null;
    }

    if (this.videoElement) {
      this.videoElement.srcObject = null;
      this.videoElement = null;
    }
  }

  /**
   * Recursive function to detect barcodes from video frames
   */
  private detectBarcodes(): void {
    if (!this.scannerActive || !this.videoElement || !this.detector) return;

    // Detect barcodes in the current video frame
    this.detector.detect(this.videoElement)
      .then((barcodes: any[]) => {
        // If barcodes were found, emit the first one's value
        if (barcodes && barcodes.length > 0) {
          this.barcodeSubject.next(barcodes[0].rawValue);
        }

        // Continue scanning if still active
        if (this.scannerActive) {
          // Use requestAnimationFrame for smooth scanning
          requestAnimationFrame(() => this.detectBarcodes());
        }
      })
      .catch((error: any) => {
        console.error('Barcode detection error:', error);
        // Continue scanning despite errors
        if (this.scannerActive) {
          requestAnimationFrame(() => this.detectBarcodes());
        }
      });
  }

  /**
   * Check if scanner is currently active
   */
  isScannerActive(): boolean {
    return this.scannerActive;
  }
}
