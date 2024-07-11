# nextjs-file-validator

`nextjs-file-validator` is a React hook for validating files. It supports validation for images and PDFs, including custom validation functions.

## API

### `useFileValidation`

**Parameters**

- `userOptions` (optional): An object containing the validation options.

**Options**

- `showAlert` (boolean): Show alert messages. Default is `false`.
- `sizeInKbAllowed` (number): Maximum allowed file size in KB. Default is `10240` (10 MB).
- `allowedTypes` (string[]): Array of allowed MIME types. Default is `['image/jpeg', 'image/png', 'application/pdf']`.
- `heightOfImage` (number): Maximum allowed height of an image. Default is `2000`.
- `widthOfImage` (number): Maximum allowed width of an image.
- `pdfPageMinCount` (number): Minimum number of pages allowed in a PDF file. Default is `1`.
- `pdfPageMaxCount` (number): Maximum number of pages allowed in a PDF file. Default is `10`.

**Features**

- Validate file size, type, and dimensions.
- Custom validation functions for images and PDFs.
- Configurable alert messages.
- Supports TypeScript.

**Usage**

```tsx
import useFileValidation from 'nextjs-file-validator';

function MyComponent() {
    const { validateFile, error } = useFileValidation();

    const handleFileChange = async (event) => {
        const file = event.target.files[0];
        try {
            await validateFile(file);
            console.log('File is valid');
            // Proceed with your logic after file validation
        } catch (error) {
            console.error('File validation failed:', error);
            // Handle error or display error message
        }
    };

    return (
        <div>
            <input type="file" onChange={handleFileChange} />
            {error && <div style={{ color: 'red' }}>{error}</div>}
        </div>
    );
}
