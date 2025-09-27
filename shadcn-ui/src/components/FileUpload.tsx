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


  return (
    <Card className="w-full h-full min-h-[550px] shadow-lg border-0 flex flex-col">
      <CardHeader className="bg-gradient-to-r from-emerald-50 to-blue-50 rounded-t-lg">
        <CardTitle className="flex items-center space-x-3 text-xl">
          <div className="p-2 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-lg">
            <Upload className="h-5 w-5 text-white" />
          </div>
          <span>Upload Energy Data</span>
        </CardTitle>
        <CardDescription className="text-base text-gray-600">
          Upload your {mode} energy consumption data in CSV format for advanced analytics
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 flex-1 flex flex-col justify-between">
        <div className="space-y-4 flex-1">
          {/* Expected Format */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium mb-2">Expected CSV Format:</h4>
            <div className="text-xs font-mono bg-white p-3 rounded border overflow-x-auto">
              <div className="whitespace-nowrap">
                {mode === 'household' ? 'timestamp,device,kwh' : 'timestamp,machine_id,kwh,process_id'}
              </div>
            </div>
            <div className="text-xs text-gray-600 mt-2 space-y-1">
              {mode === 'household' ? (
                <>
                  <div>• <strong>timestamp</strong>: ISO format (2025-09-01T00:00:00)</div>
                  <div>• <strong>device</strong>: Appliance name • <strong>kwh</strong>: Energy consumption</div>
                </>
              ) : (
                <>
                  <div>• <strong>timestamp</strong>: ISO format (2025-09-01T09:00:00)</div>
                  <div>• <strong>machine_id</strong>: Machine identifier • <strong>kwh</strong>: Energy • <strong>process_id</strong>: Process</div>
                </>
              )}
            </div>
          </div>

          {/* Upload Area */}
          <div
            className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors flex-1 flex items-center justify-center min-h-[200px] ${
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
        </div>

        {/* File Requirements */}
        <div className="text-xs text-gray-500 space-y-1 mt-auto pt-4 border-t">
          <p>• Maximum file size: 10MB</p>
          <p>• Supported format: CSV only</p>
          <p>• Timestamps should be in ISO format (YYYY-MM-DDTHH:mm:ss)</p>
          <p>• Energy values should be in kWh</p>
        </div>
      </CardContent>
    </Card>
  );
}