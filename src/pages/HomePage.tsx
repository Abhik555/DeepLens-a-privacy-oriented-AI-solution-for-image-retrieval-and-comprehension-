import React, { useState, useRef } from 'react';
import { Upload, Image as ImageIcon, Search, RefreshCw, ExternalLink, Camera, Crop as CropIcon, Globe, ArrowUpRight, Box } from 'lucide-react';
import ReactCrop, { type Crop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

interface SearchResult {
  title: string;
  link: string;
  snippet: string;
}

interface RelatedSearch {
  text: string;
}

interface ImageObject {
  name: string;
  description: string;
  attributes: string;
}

interface CaptionResponse {
  description: string;
  objects: ImageObject[];
}

function App() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [caption, setCaption] = useState<CaptionResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [relatedSearches, setRelatedSearches] = useState<RelatedSearch[]>([]);
  const [crop, setCrop] = useState<Crop>();
  const [isCropping, setIsCropping] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setSelectedImage(imageUrl);
      setCaption(null);
      setCrop(undefined);
      setIsCropping(false);
      setSearchResults([]);
      setRelatedSearches([]);
    }
  };

  const toBase64 = (file: File) => {
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  const handleGenerateCaption = async () => {
    if (!selectedImage) return;
  
    setIsLoading(true);
    setCaption(null);
    setSearchResults([]);
    setRelatedSearches([]);
  
    try {
      const file = fileInputRef.current?.files?.[0];
      if (!file) throw new Error("No image file selected");
  
      const base64Image = await toBase64(file);
      
      const response = await fetch("http://localhost:8000/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: base64Image })
      });
  
      if (!response.ok) throw new Error("Failed to generate caption");
  
      const data = await response.json();
      setCaption(typeof data.text === 'string' ? JSON.parse(data.text) : data.text);
    } catch (error) {
      console.error("Error:", error);
      setCaption({
        description: "Failed to generate caption. Please try again.",
        objects: []
      });
    } finally {
      setIsLoading(false);
    }
  };
  

  const handleSearch = async () => {
    if (!caption || caption.objects.length === 0) return;
  
    setIsSearching(true);
    try {
      // Extract object names from detected objects
      const objectNames = caption.objects.map(obj => obj.name);
  
      // Limit the number of searches (optional, adjust as needed)
      const searchKeywords = objectNames.slice(0, 5); 
  
      const mockResults = searchKeywords.map((keyword) => ({
        title: `Search Result for ${keyword}`,
        link: `https://duckduckgo.com/?q=${encodeURIComponent(keyword)}&iax=images&ia=images`,
        snippet: `This result is related to the detected object: "${keyword}".`,
      }));
  
      setSearchResults(mockResults);
  
      const relatedTerms = searchKeywords.map(word => ({
        text: `${word}`,
      }));
  
      setRelatedSearches(relatedTerms);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([
        {
          title: 'Error fetching results',
          link: '#',
          snippet: 'Please try again later.',
        },
      ]);
    } finally {
      setIsSearching(false);
    }
  };
  
  

  const handleExternalSearch = () => {
    if (caption) {
      const searchQuery = encodeURIComponent(caption.description);
      window.open(`https://duckduckgo.com/?q=${searchQuery}`, '_blank');
    }
  };
  

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const toggleCropping = () => {
    setIsCropping(!isCropping);
    if (!isCropping) {
      const img = imageRef.current;
      if (img) {
        const aspect = 16 / 9;
        const width = 30;
        const height = (width / aspect);
        setCrop({
          unit: '%',
          width,
          height,
          x: (100 - width) / 2,
          y: (100 - height) / 2
        });
      }
    }
  };

  const splitSearchResults = () => {
    const midpoint = Math.ceil(searchResults.length / 2);
    return {
      leftColumn: searchResults.slice(0, midpoint),
      rightColumn: searchResults.slice(midpoint)
    };
  };

  const { leftColumn, rightColumn } = splitSearchResults();

  return (
    <div className="animated-gradient">
      <div className="mesh-pattern">
        <div className="content-container">
          {/* Header */}
          <header className="header-container text-center">
            <div className="flex items-center justify-center mb-6">
              <Camera className="w-16 h-16 text-white mr-6" />
              <h1 className="text-7xl font-bold text-white drop-shadow-lg">
                Deep Lens
              </h1>
            </div>
            <p className="text-gray-100 text-2xl max-w-3xl mx-auto leading-relaxed">
              Transform your images into words with our advanced AI-powered caption generator
            </p>
          </header>

          {/* Main Content */}
          <div className="glass-card rounded-2xl p-8 mb-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Left Column - Upload and Preview */}
              <div className="space-y-8">
                <div>
                  <h2 className="section-title">
                    <Upload className="w-6 h-6" />
                    Upload Image
                  </h2>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageUpload}
                    accept="image/*"
                    className="hidden"
                  />
                  <button
                    onClick={triggerFileInput}
                    className="upload-zone w-full"
                  >
                    <Upload className="w-16 h-16 text-white mb-4 mx-auto opacity-50 group-hover:opacity-70 transition-opacity" />
                    <span className="text-white text-xl font-medium block mb-2">
                      Click to upload or drag and drop
                    </span>
                    <span className="text-gray-300 text-sm">
                      PNG, JPG, GIF up to 10MB
                    </span>
                  </button>
                </div>

                {selectedImage && (
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="section-title">
                        <ImageIcon className="w-6 h-6" />
                        Preview
                      </h2>
                      <button
                        onClick={toggleCropping}
                        className={`button-primary flex items-center ${
                          isCropping ? 'bg-white/20' : ''
                        }`}
                      >
                        <CropIcon className="w-4 h-4 mr-2" />
                        {isCropping ? 'Finish Selection' : 'Select Region'}
                      </button>
                    </div>
                    <div className="image-preview-container">
                      {isCropping ? (
                        <ReactCrop
                          crop={crop}
                          onChange={(c) => setCrop(c)}
                          className="max-h-[600px] w-full object-contain"
                        >
                          <img
                            ref={imageRef}
                            src={selectedImage}
                            alt="Preview"
                            className="max-h-[600px] w-full object-contain"
                          />
                        </ReactCrop>
                      ) : (
                        <img
                          ref={imageRef}
                          src={selectedImage}
                          alt="Preview"
                          className="max-h-[600px] w-full object-contain"
                        />
                      )}
                    </div>
                  </div>
                )}

                {/* Left Column Search Results */}
                {leftColumn.length > 0 && (
                  <div className="caption-container">
                    <h2 className="section-title">
                      <Globe className="w-6 h-6" />
                      Search Results
                    </h2>
                    <div className="search-results-container">
                      {leftColumn.map((result, index) => (
                        <div key={index} className="result-card">
                          <a
                            href={result.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group block"
                          >
                            <h3 className="text-white font-medium text-lg mb-2 flex items-center">
                              {result.title}
                              <ArrowUpRight className="w-4 h-4 ml-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </h3>
                            <p className="text-gray-200 text-sm leading-relaxed">
                              {result.snippet}
                            </p>
                          </a>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Related Searches */}
                {relatedSearches.length > 0 && (
                  <div className="caption-container">
                    <h2 className="section-title">Related Searches</h2>
                    <div className="related-searches">
                      {relatedSearches.map((search, index) => (
                        <button
                          key={index}
                          onClick={() => {
                            window.open(`https://duckduckgo.com/?q=${encodeURIComponent(search.text)}`, '_blank');
                          }}
                          className="related-search-tag"
                        >
                          {search.text}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column - Caption and Search */}
              <div className="space-y-8">
                {selectedImage && (
                  <div>
                    <h2 className="section-title">
                      <Search className="w-6 h-6" />
                      Generate Caption
                    </h2>
                    <button
                      onClick={handleGenerateCaption}
                      disabled={isLoading}
                      className="button-primary w-full py-4 px-6 flex items-center justify-center disabled:opacity-50"
                    >
                      {isLoading ? (
                        <RefreshCw className="w-6 h-6 mr-2 animate-spin" />
                      ) : (
                        <Search className="w-6 h-6 mr-2" />
                      )}
                      <span className="text-lg">
                        {isLoading ? 'Generating Caption...' : `Generate Caption${crop ? ' for Selected Region' : ''}`}
                      </span>
                    </button>
                  </div>
                )}

                {caption && (
                  <>
                    {/* Description Card */}
                    <div className="caption-container">
                      <h2 className="section-title">
                        <ImageIcon className="w-6 h-6" />
                        Image Description
                      </h2>
                      <p className="text-gray-100 text-lg mb-6 leading-relaxed">
                        {caption.description}
                      </p>
                      <div className="space-y-4">
                        <button
                          onClick={handleSearch}
                          disabled={isSearching}
                          className="button-primary w-full py-4"
                        >
                          {isSearching ? (
                            <RefreshCw className="w-6 h-6 mr-2 animate-spin inline-block" />
                          ) : (
                            <Globe className="w-6 h-6 mr-2 inline-block" />
                          )}
                          <span className="text-lg">
                            {isSearching ? 'Searching...' : 'Search Related Content'}
                          </span>
                        </button>
                        <button
                          onClick={handleExternalSearch}
                          className="button-primary w-full py-3 opacity-80 hover:opacity-100"
                        >
                          <ExternalLink className="w-5 h-5 mr-2 inline-block" />
                          <span>Open in DuckDuckGo</span>
                        </button>
                      </div>
                    </div>

                    {/* Objects Card */}
                    {caption.objects.length > 0 && (
                      <div className="caption-container">
                        <h2 className="section-title">
                          <Box className="w-6 h-6" />
                          Detected Objects
                        </h2>
                        <div className="space-y-4">
                          {caption.objects.map((object, index) => (
                            <div key={index} className="result-card">
                              <h3 className="text-white font-medium text-lg mb-2">
                                {object.name}
                              </h3>
                              <p className="text-gray-200 text-sm mb-2">
                                {object.description}
                              </p>
                              <p className="text-gray-300 text-sm italic">
                                {object.attributes}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Footer */}
          <footer className="text-center mb-8">
            <p className="text-white/70 text-sm">
              Powered by advanced AI technology for accurate image analysis and caption generation
            </p>
          </footer>
        </div>
      </div>
    </div>
  );
}


export default App;