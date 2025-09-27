import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, FileText, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';

interface FileUploadProps {
  mode: 'household' | 'industry';
  onUploadSuccess: (data: { message: string; records_processed: number }) => void;
}

export default function FileUpload({ mode, onUploadSuccess }: FileUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<{ success: boolean; message: string; records?: number } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = async (file: File) => {
    if (!file.name.endsWith('.csv')) {
      setUploadResult({
        success: false,
        message: 'Please upload a CSV file'
      });
      return;
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      setUploadResult({
        success: false,
        message: 'File size must be less than 10MB'
      });
      return;
    }

    setUploading(true);
    setUploadResult(null);

    try {
      const result = await api.uploadCSV(file, mode);
      setUploadResult({
        success: true,
        message: result.message,
        records: result.records_processed
      });
      onUploadSuccess(result);
    } catch (error) {
      setUploadResult({
        success: false,
        message: 'Upload failed. Please check your file format and try again.'
      });
    } finally {
      setUploading(false);
    }
  };

  const onButtonClick = () => {
    fileInputRef.current?.click();
  };

  const loadSampleData = async () => {
    setUploading(true);
    setUploadResult(null);

    try {
      // Simulate loading sample data
      const sampleFile = mode === 'household' ? 'household_sample.csv' : 'industry_sample.csv';
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const result = {
        message: `Sample ${mode} data loaded successfully`,
        records_processed: mode === 'household' ? 72 : 48
      };
      
      setUploadResult({
        success: true,
        message: result.message,
        records: result.records_processed
      });
      onUploadSuccess(result);
    } catch (error) {
      setUploadResult({
        success: false,
        message: 'Failed to load sample data'
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Upload className="h-5 w-5" />
          <span>Upload Energy Data</span>
        </CardTitle>
        <CardDescription>
          Upload your {mode} energy consumption data in CSV format
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Expected Format */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-medium mb-2">Expected CSV Format:</h4>
          {mode === 'household' ? (
            <code className="text-sm text-gray-700">
              timestamp,device,kwh<br/>
              2025-09-01T00:00:00,fridge,0.12<br/>
              2025-09-01T00:00:00,light_living,0.02
            </code>
          ) : (
            <code className="text-sm text-gray-700">
              timestamp,machine_id,kwh,process_id<br/>
              2025-09-01T09:00:00,MACH-A,5.3,LINE-1<br/>
              2025-09-01T09:00:00,MACH-B,4.8,LINE-1
            </code>
          )}
        </div>

        {/* Upload Area */}
        <div
          className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
            dragActive 
              ? 'border-blue-500 bg-blue-50' 
              : 'border-gray-300 hover:border-gray-400'
          } ${uploading ? 'pointer-events-none opacity-50' : ''}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleChange}
            className="hidden"
          />
          
          {uploading ? (
            <div className="space-y-2">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-600" />
              <p className="text-sm text-gray-600">Processing your data...</p>
            </div>
          ) : (
            <div className="space-y-4">
              <FileText className="h-12 w-12 mx-auto text-gray-400" />
              <div>
                <p className="text-lg font-medium">Drop your CSV file here</p>
                <p className="text-sm text-gray-500 mt-1">or click to browse</p>
              </div>
              <Button onClick={onButtonClick} variant="outline">
                Choose File
              </Button>
            </div>
          )}
        </div>

        {/* Sample Data Button */}
        <div className="flex justify-center">
          <Button 
            onClick={loadSampleData} 
            variant="secondary"
            disabled={uploading}
            className="w-full"
          >
            {uploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading Sample Data...
              </>
            ) : (
              <>
                <FileText className="mr-2 h-4 w-4" />
                Load Sample {mode === 'household' ? 'Household' : 'Industrial'} Data
              </>
            )}
          </Button>
        </div>

        {/* Upload Result */}
        {uploadResult && (
          <Alert className={uploadResult.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
            <div className="flex items-center space-x-2">
              {uploadResult.success ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <AlertCircle className="h-4 w-4 text-red-600" />
              )}
              <AlertDescription className={uploadResult.success ? 'text-green-700' : 'text-red-700'}>
                {uploadResult.message}
                {uploadResult.success && uploadResult.records && (
                  <span className="block mt-1 font-medium">
                    {uploadResult.records} records processed successfully
                  </span>
                )}
              </AlertDescription>
            </div>
          </Alert>
        )}

        {/* File Requirements */}
        <div className="text-xs text-gray-500 space-y-1">
          <p>• Maximum file size: 10MB</p>
          <p>• Supported format: CSV only</p>
          <p>• Timestamps should be in ISO format (YYYY-MM-DDTHH:mm:ss)</p>
          <p>• Energy values should be in kWh</p>
        </div>
      </CardContent>
    </Card>
  );
}