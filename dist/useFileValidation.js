"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = require("react");
const defaultOptions = {
    showAlert: false,
    sizeInKbAllowed: 10240,
    allowedTypes: ["image/jpeg", "image/png", "application/pdf"],
    heightOfImage: 2000,
    widthOfImage: 2000,
    pdfPageMinCount: 1,
    pdfPageMaxCount: 10,
    messages: {
        noFile: "No file selected.",
        fileSize: "File size exceeds the allowed limit.",
        fileType: "Invalid file type.",
        dimensions: "Invalid image dimensions.",
        invalidPdf: "Invalid PDF file.",
        pdfPageCount: "PDF does not meet the required page count."
    },
    customValidations: {
        image: [],
        pdf: [],
    },
};
const useFileValidation = (userOptions = {}) => {
    const [error, setError] = (0, react_1.useState)(null);
    const validateFile = (0, react_1.useCallback)((file) => {
        const options = Object.assign(Object.assign({}, defaultOptions), userOptions);
        return new Promise((resolve, reject) => {
            var _a, _b, _c, _d;
            if (!file) {
                const message = (_a = options.messages.noFile) !== null && _a !== void 0 ? _a : 'No file selected';
                if (options.showAlert) {
                    alert(message);
                }
                setError(message);
                reject(message);
                return;
            }
            const fileSize = file.size / 1024;
            if (fileSize > options.sizeInKbAllowed) {
                const message = (_b = options.messages.fileSize) !== null && _b !== void 0 ? _b : 'File size exceeds the allowed limit';
                if (options.showAlert) {
                    alert(message);
                }
                setError(message);
                reject(message);
                return;
            }
            if (!options.allowedTypes.includes(file.type)) {
                const message = (_c = options.messages.fileType) !== null && _c !== void 0 ? _c : 'Invalid file type';
                if (options.showAlert) {
                    alert(message);
                }
                setError(message);
                reject(message);
                return;
            }
            if (file.type === "application/pdf") {
                // PDF Validation
                const reader = new FileReader();
                reader.readAsArrayBuffer(file);
                reader.onload = (event) => {
                    var _a, _b, _c;
                    const pdfData = new Uint8Array(event.target.result);
                    const pdfText = new TextDecoder().decode(pdfData);
                    const isPDF = pdfText.includes("%PDF-");
                    if (!isPDF) {
                        const message = (_a = options.messages.invalidPdf) !== null && _a !== void 0 ? _a : 'Invalid PDF file';
                        if (options.showAlert) {
                            alert(message);
                        }
                        setError(message);
                        reject(message);
                        return;
                    }
                    // Extract the page count
                    const pageCountMatches = pdfText.match(/\/Count\s+(\d+)/g) || [];
                    const pageCount = pageCountMatches.reduce((count, match) => {
                        const matchCount = parseInt(match.split(' ')[1], 10);
                        return Math.max(count, matchCount);
                    }, 0);
                    if (pageCount < options.pdfPageMinCount ||
                        pageCount > options.pdfPageMaxCount) {
                        const message = (_b = options.messages.pdfPageCount) !== null && _b !== void 0 ? _b : 'PDF does not meet the required page count';
                        if (options.showAlert) {
                            alert(message);
                        }
                        setError(message);
                        reject(message);
                        return;
                    }
                    const eofIndex = pdfText.lastIndexOf("%%EOF");
                    if (eofIndex === -1) {
                        const message = (_c = options.messages.invalidPdf) !== null && _c !== void 0 ? _c : 'Invalid PDF file';
                        if (options.showAlert) {
                            alert(message);
                        }
                        setError(message);
                        reject(message);
                        return;
                    }
                    if (options.customValidations.pdf) {
                        // Apply PDF-specific custom validations
                        for (const validation of options.customValidations.pdf) {
                            const validationResult = validation(file, pdfData, pdfText);
                            if (validationResult !== true) {
                                const message = typeof validationResult === 'string' ? validationResult : 'Custom PDF validation failed';
                                if (options.showAlert) {
                                    alert(message);
                                }
                                setError(message);
                                reject(message);
                                return;
                            }
                        }
                    }
                    resolve(file);
                };
                reader.onerror = () => {
                    var _a;
                    const message = (_a = options.messages.invalidPdf) !== null && _a !== void 0 ? _a : 'Invalid PDF file';
                    if (options.showAlert) {
                        alert(message);
                    }
                    setError(message);
                    reject(message);
                };
            }
            else if (file.type.startsWith("image/")) {
                // Image Validation
                const reader = new FileReader();
                reader.readAsDataURL(file);
                reader.onload = (event) => {
                    const image = new Image();
                    image.src = event.target.result;
                    image.onload = function () {
                        var _a;
                        const height = this.height;
                        const width = this.width;
                        if (height > options.heightOfImage ||
                            width > options.widthOfImage) {
                            const message = (_a = options.messages.dimensions) !== null && _a !== void 0 ? _a : 'Invalid image dimensions';
                            if (options.showAlert) {
                                alert(message);
                            }
                            setError(message);
                            reject(message);
                        }
                        else {
                            // Apply image-specific custom validations
                            if (options.customValidations.image) {
                                for (const validation of options.customValidations.image) {
                                    const validationResult = validation(file, this);
                                    if (validationResult !== true) {
                                        const message = typeof validationResult === 'string' ? validationResult : 'Custom image validation failed';
                                        if (options.showAlert) {
                                            alert(message);
                                        }
                                        setError(message);
                                        reject(message);
                                        return;
                                    }
                                }
                            }
                            resolve(file); // Ensure resolve is called when custom validations pass
                        }
                    };
                };
            }
            else {
                // Unsupported file type
                const message = (_d = options.messages.fileType) !== null && _d !== void 0 ? _d : 'Invalid file type';
                if (options.showAlert) {
                    alert(message);
                }
                setError(message);
                reject(message);
            }
        });
    }, [userOptions]);
    return { validateFile, error };
};
exports.default = useFileValidation;
//# sourceMappingURL=useFileValidation.js.map