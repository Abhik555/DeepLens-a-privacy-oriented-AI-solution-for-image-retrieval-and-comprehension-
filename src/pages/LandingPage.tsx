import { Link } from 'react-router-dom';
import { Camera, ArrowRight, Brain, Search, Image as ImageIcon, Globe, Zap, Code, Lock } from 'lucide-react';

function LandingPage() {
  return (
    <div className="animated-gradient">
      <div className="mesh-pattern min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          {/* Hero Section */}
          <div className="text-center mb-20">
            <div className="flex items-center justify-center mb-8">
              <Camera className="w-20 h-20 text-white mr-6 floating-element" />
              <h1 className="text-8xl font-bold text-white tracking-tight glow-effect">
                Deep Lens
              </h1>
            </div>
            <p className="text-3xl text-gray-100 max-w-4xl mx-auto leading-relaxed mb-12">
              Experience the future of image analysis with our AI-powered platform
            </p>
            <div className="flex justify-center gap-6 mb-16">
              <Link
                to="/app"
                className="inline-flex items-center px-8 py-4 text-xl font-semibold text-white bg-white/20 rounded-full hover:bg-white/30 transition-all duration-300 group glow-effect"
              >
                Get Started
                <ArrowRight className="w-6 h-6 ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
            <div className="hero-image">
              <img
                src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=2000&q=80"
                alt="Digital Abstract"
                className="w-full object-cover h-[400px]"
              />
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
            <div className="feature-card">
              <Brain className="w-12 h-12 text-white mb-4 floating-element" />
              <h3 className="text-2xl font-semibold text-white mb-3">
                AI-Powered Analysis
              </h3>
              <p className="text-gray-200">
                State-of-the-art machine learning algorithms analyze your images with exceptional accuracy
              </p>
            </div>
            <div className="feature-card">
              <Zap className="w-12 h-12 text-white mb-4 floating-element" />
              <h3 className="text-2xl font-semibold text-white mb-3">
                Real-time Processing
              </h3>
              <p className="text-gray-200">
                Lightning-fast analysis and instant results for your images
              </p>
            </div>
            <div className="feature-card">
              <Globe className="w-12 h-12 text-white mb-4 floating-element" />
              <h3 className="text-2xl font-semibold text-white mb-3">
                Web Integration
              </h3>
              <p className="text-gray-200">
                Seamlessly connect with web content based on image analysis
              </p>
            </div>
          </div>

          {/* Technology Stack */}
          <div className="glass-card rounded-3xl p-12 mb-20">
            <h2 className="text-4xl font-bold text-white text-center mb-12">
              Powered by Advanced Technology
            </h2>
            <div className="tech-grid">
              <div className="tech-item">
                <Brain className="w-8 h-8 text-white mx-auto mb-3" />
                <span className="text-white">Neural Networks</span>
              </div>
              <div className="tech-item">
                <Code className="w-8 h-8 text-white mx-auto mb-3" />
                <span className="text-white">Modern Stack</span>
              </div>
              <div className="tech-item">
                <Lock className="w-8 h-8 text-white mx-auto mb-3" />
                <span className="text-white">Secure Platform</span>
              </div>
              <div className="tech-item">
                <ImageIcon className="w-8 h-8 text-white mx-auto mb-3" />
                <span className="text-white">Image Processing</span>
              </div>
            </div>
          </div>

          {/* How It Works */}
          <div className="glass-card rounded-3xl p-12 mb-20">
            <h2 className="text-4xl font-bold text-white text-center mb-12">
              How It Works
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6 floating-element">
                  <span className="text-2xl font-bold text-white">1</span>
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">
                  Upload Your Image
                </h3>
                <p className="text-gray-200">
                  Drag and drop or select any image to analyze
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6 floating-element">
                  <span className="text-2xl font-bold text-white">2</span>
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">
                  AI Analysis
                </h3>
                <p className="text-gray-200">
                  Our advanced AI processes and understands your image
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6 floating-element">
                  <span className="text-2xl font-bold text-white">3</span>
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">
                  Get Insights
                </h3>
                <p className="text-gray-200">
                  Receive detailed analysis and explore related content
                </p>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="text-center">
            <div className="mb-12">
              <img
                src="https://images.unsplash.com/photo-1506318137071-a8e063b4bec0?auto=format&fit=crop&w=2000&q=80"
                alt="Abstract Technology"
                className="w-full h-[300px] object-cover rounded-2xl"
              />
            </div>
            <h2 className="text-4xl font-bold text-white mb-8">
              Ready to Experience the Future?
            </h2>
            <Link
              to="/app"
              className="inline-flex items-center px-8 py-4 text-xl font-semibold text-white bg-white/20 rounded-full hover:bg-white/30 transition-all duration-300 group glow-effect"
            >
              Try Deep Lens Now
              <ArrowRight className="w-6 h-6 ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LandingPage;