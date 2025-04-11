// App.jsx
import React, { useState, useRef, useEffect } from "react";
import QRCode from "react-qr-code";
import { compressToEncodedURIComponent } from "lz-string";
// -import htmlToImage from "html-to-image";
 import * as htmlToImage from "html-to-image";

import "./index.css";

const TemplateStyles = {
  default: "bg-blue-50 border-blue-600",
  alternate: "bg-green-50 border-green-600",
};

const App = () => {
  const [formData, setFormData] = useState({
    name: "",
    roll: "",
    classDivision: "A",
    allergies: [],
    photo: "",
    rack: "",
    busRoute: "1",
  });

  const [submitted, setSubmitted] = useState(false);
  const [template, setTemplate] = useState("default");
  const cardRef = useRef(null);

  useEffect(() => {
    const saved = localStorage.getItem("studentCards");
    if (saved) {
      setSubmitted(true);
      setFormData(JSON.parse(saved));
    }
  }, []);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "photo") {
      const reader = new FileReader();
      reader.onload = () => {
        setFormData((prev) => ({ ...prev, photo: reader.result }));
      };
      reader.readAsDataURL(files[0]);
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleAllergies = (e) => {
    const options = Array.from(e.target.selectedOptions, (o) => o.value);
    setFormData((prev) => ({ ...prev, allergies: options }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    localStorage.setItem("studentCards", JSON.stringify(formData));
    setSubmitted(true);
  };

  const downloadCard = () => {
    if (cardRef.current) {
      htmlToImage.toPng(cardRef.current).then((dataUrl) => {
        const link = document.createElement("a");
        link.download = `${formData.name}_id_card.png`;
        link.href = dataUrl;
        link.click();
      });
    }
  };

  const minimalData = {
    name: formData.name,
    roll: formData.roll,
    classDivision: formData.classDivision,
    rack: formData.rack,
    busRoute: formData.busRoute,
    allergies: formData.allergies?.slice(0, 3),
  };

  const qrData = compressToEncodedURIComponent(JSON.stringify(minimalData));
  useEffect(() => {
    const saved = localStorage.getItem("studentCards");
    if (saved) {
      const parsedData = JSON.parse(saved);
      if (parsedData.name && parsedData.roll) {
        setFormData(parsedData);
        setSubmitted(true);
      }
    }
  }, []);
  

  return (
    <div className="p-6 font-sans space-y-6 max-w-4xl mx-auto  
">
      <h1 className="text-3xl font-bold text-center text-indigo-600">
        Unity Student ID Card Generator
      </h1>

      <div className="flex justify-between items-center">
        <label className="font-medium">Switch Template: </label>
        <select
          value={template}
          onChange={(e) => setTemplate(e.target.value)}
          className="border p-1 rounded"
        >
          <option value="default">Blue Template</option>
          <option value="alternate">Green Template</option>
        </select>
      </div>

      {!submitted && (
        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          <input
            type="text"
            name="name"
            placeholder="Student Name"
            value={formData.name}
            onChange={handleChange}
            required
            className="border p-2 rounded"
          />
          <input
            type="text"
            name="roll"
            placeholder="Roll Number"
            value={formData.roll}
            onChange={handleChange}
            required
            className="border p-2 rounded"
          />
          <select
            name="classDivision"
            value={formData.classDivision}
            onChange={handleChange}
            className="border p-2 rounded"
          >
            <option value="A">A</option>
            <option value="B">B</option>
            <option value="C">C</option>
          </select>
          <select
            multiple
            name="allergies"
            onChange={handleAllergies}
            className="border p-2 rounded h-24"
          >
            <option value="Peanuts">Peanuts</option>
            <option value="Gluten">Gluten</option>
            <option value="Dairy">Dairy</option>
            <option value="Dust">Dust</option>
          </select>
          <input
            type="file"
            accept="image/*"
            name="photo"
            onChange={handleChange}
            className="border p-2 rounded"
          />
          <input
            type="text"
            name="rack"
            placeholder="Rack Number"
            value={formData.rack}
            onChange={handleChange}
            className="border p-2 rounded"
          />
          <select
            name="busRoute"
            value={formData.busRoute}
            onChange={handleChange}
            className="border p-2 rounded"
          >
            <option value="1">Route 1</option>
            <option value="2">Route 2</option>
            <option value="3">Route 3</option>
          </select>
          <button
            type="submit"
            className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
          >
            Generate ID Card
          </button>
        </form>
      )}

      {submitted && (
        <div className="flex flex-col items-center gap-4 text-black">
          <div
            ref={cardRef}
            className={`p-4 border-4 rounded-xl w-full max-w-sm ${TemplateStyles[template]} shadow-xl`}
          >
            <h2 className="text-xl font-bold mb-3 text-center">Student ID</h2>
            <div className="flex flex-col items-center gap-2">
              <img
                src={formData.photo}
                alt="Student"
                className="w-24 h-24 object-cover rounded-full border"
              />
              <div className="text-left w-full px-2 space-y-1 text-sm">
                <p><strong>Name:</strong> {formData.name}</p>
                <p><strong>Roll No:</strong> {formData.roll}</p>
                <p><strong>Class:</strong> {formData.classDivision}</p>
                <p><strong>Rack:</strong> {formData.rack}</p>
                <p><strong>Bus Route:</strong> {formData.busRoute}</p>
                {formData.allergies.length > 0 && (
                  <p><strong>Allergies:</strong> {formData.allergies.join(", ")}</p>
                )}
              </div>
              <div className="bg-white p-2 rounded shadow">
                <QRCode value={qrData} size={128} />
              </div>
            </div>
          </div>

          <button
            onClick={downloadCard}
            className="mt-4 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            Download as PNG
          </button>
        </div>
      )}
    </div>
  );
};

export default App;
