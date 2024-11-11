import React, { useState } from 'react';
import axios from 'axios'; // To send the file to the server

function UPLOADPIC() {
    const [file, setFile] = useState(null);
    const [fileName, setFileName] = useState('');
    const [message, setMessage] = useState('');


    function handleChange(e) {
        const selectedFile = e.target.files[0];
        if (selectedFile && (selectedFile.type === 'image/jpeg' || selectedFile.type === 'image/png')) {
            setFile(selectedFile);
            setFileName(selectedFile.name);
        } else {
            alert('Please upload a JPEG or PNG image.');
            e.target.value = null; 
        }
    }

    async function handleSave() {
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);
        formData.append('filename', fileName);

        try {
            const response = await axios.post('http://localhost:5000/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            }).then(res => { 
                setMessage(res.data.message); 
                setTimeout(() => setMessage(''), 1000);         
               })
            .catch(err => console.log(err));
            console.log('File uploaded successfully:', response.data);
        } catch (error) {
            console.error('Error uploading file:', error);
        }
    }

    return (
        <div className="App" style={{ marginTop: "240px", marginLeft: "450px" }}>
            <h2>Add Image:</h2>
            <input id="profile-img-file-input" onChange = {handleChange} type="file" accept="image/jpeg, image/png" />
            {file && <img src={URL.createObjectURL(file)} alt="Selected" />}
            <button onClick={handleSave} style={{ display: 'block', marginTop: '20px' }}>SAVE</button>
            {message && <p className='text-success'>{message}</p>} {/* Render the confirmation message */}
        </div>
    );
}

export default UPLOADPIC;
