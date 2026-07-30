import "../css/UploadFileBox.css";

function UploadFileBox({selectedFile,setSelectedFile,onAnalyze,isLoading}) {
    {/* const [selectedFile, setSelectedFile] = useState([]); // for multiple files */}

    function handleFileChange(event) {
        const file = event.target.files[0]; // for single file

        /*
        const files = event.target.files; // for multiple files

        for (let i = 0; i < files.length; i++) {
            console.log(files[i].name);
        }
        */

        setSelectedFile(file); // for single file

        // setSelectedFile(Array.from(files)); // for multiple files
    }

    return (
        <div className="upload-file">
            <p>Drag and drop your file here</p>
            <p>or click to browse</p>
            <p>The file can be a pdf,docx or txt - max 10MB</p>

            <input
                type="file"
                accept=".pdf,.docx,.txt"
                onChange={handleFileChange}
                // multiple
                disabled={isLoading}   
            />

            {/* for single file */}
            {selectedFile && <p>Selected File: {selectedFile.name}</p>}

            {/*
            for multiple files

            {selectedFile &&
                <ul>
                    {selectedFile.map((selectFile) => (
                        <li>{selectFile.name}</li>
                    ))}
                </ul>
            }
            */}

            <button onClick = {onAnalyze} disabled={isLoading}>
                {isLoading ? "Analyzing...." : "Analyze with AI"}</button>
        </div>
    );
}

export default UploadFileBox;