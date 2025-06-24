import React, { useState } from 'react';

const App = () => {

    const [resumeImageBase64, setResumeImageBase64] = useState(null);
    const [reviewFeedback, setReviewFeedback] = useState(''); 
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [showAlert, setShowAlert] = useState(false);
    const [alertMessage, setAlertMessage] = useState('');
    const [fileName, setFileName] = useState('');

 
    const showCustomAlert = (message) => {
        setAlertMessage(message);
        setShowAlert(true);
    };

    const hideCustomAlert = () => {
        setShowAlert(false);
        setAlertMessage('');
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
           
            if (file.type !== 'image/png') {
                showCustomAlert('Please upload a PNG image file.');
                setResumeImageBase64(null);
                setFileName('');
                setError('');
                return;
            }

            setFileName(file.name);
            setError(''); 

            const reader = new FileReader();
            reader.onloadend = () => {
          
                const base64String = reader.result.split(',')[1];
                setResumeImageBase64(base64String);
            };
            reader.onerror = () => {
                setError('Failed to read file. Please try again.');
                setResumeImageBase64(null);
                setFileName('');
            };
            reader.readAsDataURL(file);
        } else {
            setResumeImageBase64(null);
            setFileName('');
        }
    };


    const reviewResume = async () => {
        if (!resumeImageBase64) {
            showCustomAlert('Please upload a PNG resume image to get a review.');
            return;
        }

        setIsLoading(true);
        setReviewFeedback('');
        setError('');

        try {
           
            const prompt = `Analyze this resume image. First, transcribe the text from the image as accurately as possible. Then, provide constructive feedback on its structure, content, clarity, and any suggestions for improvement. Focus on making it more impactful for a job application. Organize your feedback into clear sections (e.g., Transcribed Text, Summary, Experience, Skills, Education, General Tips).`;

           
            const payload = {
                contents: [
                    {
                        role: "user",
                        parts: [
                            { text: prompt },
                            {
                                inlineData: {
                                    mimeType: "image/png", 
                                    data: resumeImageBase64 
                                }
                            }
                        ]
                    }
                ],
            };

            
            const apiKey = "";
            const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

            
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

           
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`API error: ${errorData.error.message || response.statusText}`);
            }

            const result = await response.json();

           
            if (result.candidates && result.candidates.length > 0 &&
                result.candidates[0].content && result.candidates[0].content.parts &&
                result.candidates[0].content.parts.length > 0) {
                const text = result.candidates[0].content.parts[0].text;
                setReviewFeedback(text);
            } else {
                setError('Could not get a valid response from the AI. Please try again.');
            }
        } catch (err) {
            console.error('Error reviewing resume:', err);
            setError(`Failed to review resume: ${err.message}. Please try again.`);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 flex items-center justify-center p-4 font-sans antialiased">
            <script src="https://cdn.tailwindcss.com"></script>
            <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />

            {/* Custom Alert Modal */}
            {showAlert && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 transform transition-all scale-100 animate-fade-in">
                        <p className="text-lg font-semibold text-gray-800 mb-4">{alertMessage}</p>
                        <button
                            onClick={hideCustomAlert}
                            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105"
                        >
                            Got It
                        </button>
                    </div>
                </div>
            )}

            <div className="w-full max-w-4xl bg-white rounded-xl shadow-2xl p-8 transform transition-all duration-300 hover:shadow-3xl">
                <h1 className="text-4xl font-extrabold text-center text-indigo-800 mb-8 tracking-tight">
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-indigo-600">Resume Reviewer</span> ✨
                </h1>

                {/* Resume Upload Section */}
                <div className="mb-8 p-6 bg-gray-50 rounded-lg border border-gray-200">
                    <label htmlFor="resumeUpload" className="block text-xl font-semibold text-gray-700 mb-3">
                        Upload Your Resume (PNG only):
                    </label>
                    <input
                        type="file"
                        id="resumeUpload"
                        accept="image/png"
                        onChange={handleFileChange}
                        className="w-full text-gray-800 file:mr-4 file:py-2 file:px-4
                                   file:rounded-full file:border-0
                                   file:text-sm file:font-semibold
                                   file:bg-indigo-50 file:text-indigo-700
                                   hover:file:bg-indigo-100
                                   cursor-pointer transition duration-200 ease-in-out"
                    />
                    {fileName && (
                        <p className="text-sm text-gray-600 mt-2">Selected file: <span className="font-medium">{fileName}</span></p>
                    )}
                    {resumeImageBase64 && (
                        <div className="mt-4 border border-gray-300 rounded-lg overflow-hidden">
                            <img
                                src={`data:image/png;base64,${resumeImageBase64}`}
                                alt="Resume Preview"
                                className="max-w-full h-auto mx-auto block rounded-lg"
                                style={{ maxHeight: '300px', objectFit: 'contain' }}
                            />
                        </div>
                    )}
                    <p className="text-sm text-gray-500 mt-2">
                        *Please upload your resume as a PNG image file.*
                    </p>
                </div>

                {/* Action Button */}
                <div className="flex justify-center mb-10">
                    <button
                        onClick={reviewResume}
                        disabled={isLoading || !resumeImageBase64}
                        className={`
                            px-8 py-3 rounded-xl font-bold text-lg transition duration-300 ease-in-out transform
                            ${isLoading || !resumeImageBase64
                                ? 'bg-indigo-300 text-white cursor-not-allowed animate-pulse'
                                : 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg hover:shadow-xl hover:scale-105 active:scale-95'
                            }
                            focus:outline-none focus:ring-4 focus:ring-indigo-300
                        `}
                    >
                        {isLoading ? (
                            <span className="flex items-center">
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Reviewing...
                            </span>
                        ) : (
                            'Get Resume Review'
                        )}
                    </button>
                </div>

                {/* Error Message Display */}
                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-lg relative mb-8 shadow-md" role="alert">
                        <strong className="font-bold">Error: </strong>
                        <span className="block sm:inline">{error}</span>
                    </div>
                )}

                {/* Review Feedback Section */}
                {reviewFeedback && (
                    <div className="mt-8 p-6 bg-white rounded-xl shadow-inner border border-indigo-200">
                        <h2 className="text-3xl font-bold text-indigo-700 mb-6 text-center">
                            AI Review Feedback
                        </h2>
                        <div className="prose prose-indigo max-w-none text-gray-800 leading-relaxed break-words whitespace-pre-wrap">
                            {reviewFeedback}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default App;
