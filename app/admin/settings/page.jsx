'use client';
import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/useStore';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';

const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });
import 'react-quill/dist/quill.snow.css';

export default function AdminSettings() {
  const { user, isAuthenticated } = useAuthStore();
  const router = useRouter();
  const [settings, setSettings] = useState({
    businessName: 'Hafiz Tech',
    slogan: 'Elite Store',
    headerLogo: '',
    footerLogo: '',
    aboutContent: 'Welcome to our amazing e-commerce store!'
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'admin') {
      router.push('/auth/login');
      return;
    }
    fetchSettings();
  }, [isAuthenticated, user, router]);

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/site-settings');
      if (response.ok) {
        const data = await response.json();
        setSettings(data);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const response = await fetch('/api/site-settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      });

      if (response.ok) {
        alert('Settings updated successfully!');
      }
    } catch (error) {
      console.error('Error updating settings:', error);
      alert('Error updating settings');
    } finally {
      setSaving(false);
    }
  };

  const handleLogoUpload = async (file, type) => {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setSettings(prev => ({
          ...prev,
          [type]: data.url
        }));
      }
    } catch (error) {
      console.error('Upload error:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Site Settings</h1>

        <div className="bg-white rounded-lg shadow-md p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Business Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Business Name
              </label>
              <input
                type="text"
                value={settings.businessName}
                onChange={(e) => setSettings({...settings, businessName: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                placeholder="Enter business name"
              />
            </div>
            {/* Slogan */}
               <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Slogan
              </label>
              <input
                type="text"
                value={settings.slogan}
                onChange={(e) => setSettings({...settings, slogan: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                placeholder="Enter slogan"
              />
            </div>
            {/* Header Logo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Header Logo
              </label>
              <div className="flex items-center space-x-4">
                {settings.headerLogo && (
                  <img
                    src={settings.headerLogo}
                    alt="Header Logo"
                    className="h-16 w-16 object-cover rounded"
                  />
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) handleLogoUpload(file, 'headerLogo');
                  }}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
              </div>
            </div>

            {/* Footer Logo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Footer Logo
              </label>
              <div className="flex items-center space-x-4">
                {settings.footerLogo && (
                  <img
                    src={settings.footerLogo}
                    alt="Footer Logo"
                    className="h-16 w-16 object-cover rounded"
                  />
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) handleLogoUpload(file, 'footerLogo');
                  }}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
              </div>
            </div>

            {/* About Content */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                About/Intro Content (Homepage)
              </label>
              <ReactQuill
                value={settings.aboutContent}
                onChange={(value) => setSettings({...settings, aboutContent: value})}
                modules={{
                  toolbar: [
                    [{ 'header': [1, 2, 3, false] }],
                    ['bold', 'italic', 'underline', 'strike'],
                    [{'list': 'ordered'}, {'list': 'bullet'}],
                    ['link', 'image'],
                    ['clean']
                  ],
                }}
                className="bg-white"
                style={{ height: '200px', marginBottom: '50px' }}
              />
            </div>

            {/* Submit Button */}
            <div className="pt-12">
              <button
                type="submit"
                disabled={saving}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? 'Saving...' : 'Save Settings'}
              </button>
            </div>
          </form>
        </div>

        {/* Preview Section */}
        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Preview</h2>
          
          <div className="space-y-4">
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold text-gray-700 mb-2">Header Preview</h3>
              <div className="flex items-center space-x-4 bg-gray-50 p-4 rounded">
                {settings.headerLogo && (
                  <img
                    src={settings.headerLogo}
                    alt="Header Logo"
                    className="h-8 w-8 object-cover"
                  />
                )}
                <span className="text-xl font-bold text-blue-600">
                  {settings.businessName}
                </span>
              </div>
            </div>

            <div className="border rounded-lg p-4">
              <h3 className="font-semibold text-gray-700 mb-2">About Section Preview</h3>
              <div 
                className="prose max-w-none"
                dangerouslySetInnerHTML={{ __html: settings.aboutContent }}
              />
            </div>

            <div className="border rounded-lg p-4">
              <h3 className="font-semibold text-gray-700 mb-2">Footer Preview</h3>
              <div className="flex items-center space-x-4 bg-gray-900 text-white p-4 rounded">
                {settings.footerLogo && (
                  <img
                    src={settings.footerLogo}
                    alt="Footer Logo"
                    className="h-8 w-8 object-cover"
                  />
                )}
                <span className="text-lg font-bold">
                  {settings.businessName}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}