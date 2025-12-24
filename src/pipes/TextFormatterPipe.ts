// src/app/shared/pipes/text-formatter.pipe.ts
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'textFormatter',
  standalone: true
})
export class TextFormatterPipe implements PipeTransform {
  transform(value: string): string {
    if (!value) return '';

    value = value.toString();

    // For ALL CAPS text, convert to Title Case
    if (value === value.toUpperCase()) {
      return value
        .toLowerCase()
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
    }

    // If it's not all caps, return the original
    return value;
  }
}
