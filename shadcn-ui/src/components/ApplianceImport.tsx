import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Upload, 
  FileText, 
  CheckCircle, 
  AlertCircle, 
  Loader2, 
  Zap, 
  Info,
  Settings
} from 'lucide-react';
import { api, ApplianceDetail, ImportedApplianceData } from '@/lib/api';

interface ApplianceImportProps {
  onImportSuccess: (data: ImportedApplianceData) => void;
}

export default function ApplianceImport({ onImportSuccess }: ApplianceImportProps) {
  const [dragActive, setDragActive] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<{ success: boolean; message: string; data?: ImportedApplianceData } | null>(null);
  const [importedAppliances, setImportedAppliances] = useState<ApplianceDetail[]>([]);
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
      setImportResult({
        success: false,
        message: 'Please upload a CSV file containing appliance details'
      });
      return;
    }

    setImporting(true);
    setImportResult(null);

    try {
      const data = await api.importApplianceData(file);
      setImportedAppliances(data.appliances);
      setImportResult({
        success: true,
        message: `Successfully imported ${data.total_appliances} appliances and generated ${data.consumption_data.length} consumption data points`,
        data
      });
      onImportSuccess(data);
    } catch (error) {
      setImportResult({
        success: false,
        message: error instanceof Error ? error.message : 'Import failed'
      });
    } finally {
      setImporting(false);
    }
  };


  return (
    <Card className="w-full h-full min-h-[550px] shadow-lg border-0 flex flex-col">
      <CardHeader className="bg-gradient-to-r from-emerald-50 to-blue-50 rounded-t-lg">
        <CardTitle className="flex items-center space-x-3 text-xl">
          <div className="p-2 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-lg">
            <Settings className="h-5 w-5 text-white" />
          </div>
          <span>Import Appliance Details</span>
        </CardTitle>
        <CardDescription className="text-base text-gray-600">
          Import your appliance specifications for personalized AI analysis and recommendations
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 flex-1 flex flex-col">
        <Tabs defaultValue="import" className="space-y-6 flex-1 flex flex-col">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="import">Import Data</TabsTrigger>
            <TabsTrigger value="preview">Preview & Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="import" className="space-y-6 flex-1 flex flex-col">
            <div className="space-y-4 flex-1">
              {/* Expected Format */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Required CSV Format:</h4>
                <div className="text-xs font-mono bg-white p-3 rounded border overflow-x-auto">
                  <div className="whitespace-nowrap">
                    name,type,brand,model,rated_power,energy_efficiency_rating,age_years,usage_hours_per_day,location
                  </div>
                </div>
                <div className="text-xs text-gray-600 mt-2 space-y-1">
                  <div>• <strong>name</strong>: Appliance identifier (e.g., "Living Room AC")</div>
                  <div>• <strong>type</strong>: air_conditioner, refrigerator, washing_machine, tv, lighting</div>
                  <div>• <strong>rated_power</strong>: Power in watts • <strong>efficiency</strong>: A++, A+, A, B, C</div>
                </div>
              </div>

              {/* File Upload Area */}
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors flex-1 flex items-center justify-center min-h-[200px] ${
                  dragActive 
                    ? 'border-blue-400 bg-blue-50' 
                    : 'border-gray-300 hover:border-gray-400'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleChange}
                className="hidden"
              />
              
              {importing ? (
                <div className="space-y-4">
                  <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto" />
                  <div>
                    <p className="text-lg font-medium">Importing appliance data...</p>
                    <p className="text-sm text-gray-600">Analyzing appliances and generating consumption patterns</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <Upload className="h-12 w-12 text-gray-400 mx-auto" />
                  <div>
                    <p className="text-lg font-medium">Drop your appliance CSV file here</p>
                    <p className="text-sm text-gray-600">or click to browse files</p>
                  </div>
                    <Button variant="outline">
                      <FileText className="h-4 w-4 mr-2" />
                      Select CSV File
                    </Button>
                  </div>
                )}
              </div>

              {/* Import Result */}
              {importResult && (
                <Alert className={importResult.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
                  {importResult.success ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-red-600" />
                  )}
                  <AlertDescription className={importResult.success ? 'text-green-700' : 'text-red-700'}>
                    {importResult.message}
                    {importResult.success && importResult.data && (
                      <div className="mt-2 text-sm">
                        <div>• {importResult.data.total_appliances} appliances imported</div>
                        <div>• {importResult.data.consumption_data.length} data points generated</div>
                        <div>• AI analysis and recommendations updated</div>
                      </div>
                    )}
                  </AlertDescription>
                </Alert>
              )}
            </div>

            {/* File Requirements - matching FileUpload layout */}
            <div className="text-xs text-gray-500 space-y-1 mt-auto pt-4 border-t">
              <p>• Maximum file size: 10MB</p>
              <p>• Supported format: CSV only</p>
              <p>• Headers must match exactly as shown above</p>
              <p>• All appliances should have unique names</p>
            </div>
          </TabsContent>

          <TabsContent value="preview" className="space-y-6 flex-1 flex flex-col">
            {importedAppliances.length === 0 ? (
              <div className="text-center py-8 text-gray-500 flex-1 flex flex-col items-center justify-center">
                <Settings className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="font-medium">No appliances imported yet</p>
                <p className="text-sm">Import your appliance data to see the preview and analytics</p>
              </div>
            ) : (
              <div className="space-y-6 flex-1">
                {/* Summary Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-blue-50 rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <Zap className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-medium text-blue-900">Total Appliances</span>
                    </div>
                    <div className="text-2xl font-bold text-blue-900">{importedAppliances.length}</div>
                  </div>
                  <div className="bg-green-50 rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <Zap className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium text-green-900">Total Power</span>
                    </div>
                    <div className="text-2xl font-bold text-green-900">
                      {importedAppliances.reduce((sum, app) => sum + app.rated_power, 0).toLocaleString()}W
                    </div>
                  </div>
                  <div className="bg-yellow-50 rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <Zap className="h-4 w-4 text-yellow-600" />
                      <span className="text-sm font-medium text-yellow-900">Efficient Appliances</span>
                    </div>
                    <div className="text-2xl font-bold text-yellow-900">
                      {importedAppliances.filter(app => 
                        app.energy_efficiency_rating?.toLowerCase().includes('a')
                      ).length}
                    </div>
                  </div>
                </div>

                {/* Appliance List */}
                <div className="space-y-3 flex-1">
                  <h3 className="font-medium text-lg">Imported Appliances</h3>
                  <div className="space-y-2 max-h-64 overflow-y-auto border rounded-lg p-2">
                    {importedAppliances.map((appliance, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <div className="font-medium">{appliance.name}</div>
                          <div className="text-sm text-gray-600">
                            {appliance.brand} {appliance.model} • {appliance.rated_power}W
                            {appliance.location && ` • ${appliance.location}`}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {appliance.energy_efficiency_rating && (
                            <Badge variant="outline" className={
                              appliance.energy_efficiency_rating.toLowerCase().includes('a') 
                                ? 'border-green-500 text-green-700' 
                                : 'border-yellow-500 text-yellow-700'
                            }>
                              {appliance.energy_efficiency_rating}
                            </Badge>
                          )}
                          {appliance.age_years && (
                            <Badge variant="secondary">
                              {appliance.age_years}y old
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}