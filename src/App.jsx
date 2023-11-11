// App.jsx
import React, { useState } from 'react';

const App = () => {
    const [file, setFile] = useState(null);
    const [additionalDetails, setAdditionalDetails] = useState('');
    const [preview, setPreview] = useState(''); // To hold the image preview URL
    const [loading, setLoading] = useState(false); // Loading state
    const [appraisalResponse, setAppraisalResponse] = useState(null); // State to hold the appraisal response

    const onAppraisalSubmit = async (uploadedFile, details) => {
        setLoading(true); // Start loading
        setAppraisalResponse(null); // Reset appraisal response state
        try {
            // Replace with actual logic for upload URL retrieval
            const imageUrl = await uploadImage(uploadedFile);
            // Replace with actual logic for appraisal request
            const appraisalResponse = await requestAppraisal(imageUrl, details);
            setAppraisalResponse(appraisalResponse); // Set the appraisal response state
        } catch (error) {
            console.error('An error occurred:', error);
            // Handle error state as needed, e.g., show an error message
        }
        setLoading(false); // End loading
    };

    const handleFileChange = event => {
        const reader = new FileReader();
        const uploadedFile = event.target.files[0];
        reader.onloadend = () => {
            setPreview(reader.result);
            setFile(uploadedFile);
        };
        if (uploadedFile) {
            reader.readAsDataURL(uploadedFile);
        }
    };

    const handleDetailsChange = event => {
        setAdditionalDetails(event.target.value);
    };

    const handleSubmit = event => {
        event.preventDefault();
        if (file) {
            onAppraisalSubmit(file, additionalDetails);
        } else {
            alert('Please select a file to upload.');
        }
    };
    return (
        <div className="container mx-auto p-4">
            <form onSubmit={handleSubmit} className="max-w-md mx-auto">
                <div className="mb-4">
                    {preview && <img src={preview} alt="Preview" className="h-48 w-full object-cover mb-4" />}
                    <div className="flex items-center justify-center bg-grey-lighter">
                        <label className="w-full flex flex-col items-center px-4 py-6 bg-white text-blue rounded-lg shadow-lg tracking-wide uppercase border border-blue cursor-pointer hover:bg-blue hover:text-white">
                            <svg className="w-8 h-8" fill="currentColor" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                                <path d="M16.7,5.3l-2-2C14.5,3.1,14.3,3,14,3H6C5.4,3,5,3.4,5,4v12c0,0.6,0.4,1,1,1h8c0.6,0,1-0.4,1-1V6C16,5.7,16.9,5.5,16.7,5.3z M15,15H5V5h7v2c0,0.6,0.4,1,1,1h2V15z"></path>
                                <path d="M8.5,8.6c-0.8,0-1.6,0.3-2.2,0.9C5.9,10.1,5.6,11,5.6,11.8s0.3,1.7,0.9,2.3C7.1,14.7,8,15,8.8,15s1.7-0.3,2.3-0.9c0.6-0.6,0.9-1.4,0.9-2.3s-0.3-1.7-0.9-2.3C10.1,8.9,9.3,8.6,8.5,8.6z M10,12.5c-0.2,0.2-0.5,0.4-0.8,0.4s-0.6-0.1-0.8-0.4c-0.2-0.2-0.4-0.5-0.4-0.8s0.1-0.6,0.4-0.8c0.2-0.2,0.5-0.4,0.8-0.4s0.6,0.1,0.8,0.4c0.2,0.2,0.4,0.5,0.4,0.8S10.2,12.3,10,12.5z"></path>
                            </svg>
                            <span className="mt-2 text-base leading-normal">Select a photo</span>
                            <input type="file" className="hidden" onChange={handleFileChange} />
                        </label>
                    </div>
                </div>
                <div className="mb-4">
                    <label htmlFor="additional-details" className="block text-sm font-medium text-gray-700">
                        Additional Details
                    </label>
                    <textarea
                        id="additional-details"
                        name="additional-details"
                        rows="4"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                        placeholder="Provide any additional details here."
                        value={additionalDetails}
                        onChange={handleDetailsChange}
                    ></textarea>
                </div>
                <div className="flex justify-center mt-8">
                    <button
                        type="submit"
                        disabled={loading}
                        className={`px-6 py-2 text-base font-medium rounded-md text-white transition ease-in-out duration-150 ${
                            loading
                                ? 'bg-gray-400'
                                : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:border-blue-700 focus:ring focus:ring-blue-200 active:bg-blue-700'
                        }`}
                    >
                        {loading ? 'Loading...' : 'Request Appraisal'}
                    </button>
                </div>

                {loading && <div className="mt-4 flex justify-center"> {/* Spinner or loading indicator */}</div>}
                {appraisalResponse && (
                    <div className="mt-4 p-4 bg-gray-100 rounded-md">
                        <h3 className="text-lg font-semibold">Appraisal Result</h3>
                        <p>{appraisalResponse.logic_for_the_appraised_price}</p>
                        <p className="font-bold">Appraised Price: ${appraisalResponse.appraised_price}</p>
                    </div>
                )}
            </form>
        </div>
    );
};

async function uploadImage(file) {
    // Create a new FormData instance
    const formData = new FormData();
    // Append the file to the 'image' key
    formData.append('image', file);

    try {
        const response = await fetch('https://simple-image-upload-server.onrender.com/upload', {
            method: 'POST',
            // Removed the 'Content-Type' header, let the browser set it
            headers: {
                Authorization: 'Bearer supersecretpassword', // Add your actual token here
            },
            body: formData, // Attach the form data to the body
        });

        // Check if the response was ok (status in the range 200-299)
        if (!response.ok) {
            // You can handle different response status codes here, if needed
            throw new Error('Network response was not ok: ' + response.statusText);
        }

        const data = await response.json(); // Parse JSON data from the response

        return data.url; // Return the data to be used by the calling code
    } catch (err) {
        // It's a good practice to log errors
        console.error('Upload failed:', err);
        throw err; // Rethrowing the error is important if you want to handle it later
    }
}

// Placeholder for request appraisal function
async function requestAppraisal(imageUrl, details) {
    console.log('imageUrl:', imageUrl);
    console.log('details:', details);

    try {
        const response = await fetch('https://ebay-gpt-vision.onrender.com/search', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ imageUrl, details }),
        });

        if (!response.ok) {
            throw new Error('Network response was not ok: ' + response.statusText);
        }

        const data = await response.json();

        console.log('Appraisal response:', data);

        return data;
    } catch (err) {
        console.error('Appraisal request failed:', err);
        throw err;
    }

    // You would typically send the imageUrl and details to your endpoint here.
    // This is just a placeholder response.
    return new Promise(resolve => {
        setTimeout(
            () =>
                resolve({
                    logic_for_the_appraised_price: 'The appraised price is determined by analyzing the market trends...',
                    appraised_price: 62,
                }),
            500
        );
    });
}

export default App;
