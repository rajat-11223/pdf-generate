const jade = require('jade');
const path = require('path');
const puppeteer = require('puppeteer');
const crypto = require('crypto');
const fs = require('fs').promises;

const generatePdf = async (req, res, next) => {
	const { principalName, principalCity, principalCounty, state, maritalStatus, partnerName, children } = req.body;
    /// example dynamic data how you can pass the data coming from frontend
	const pets = [
		{ name: 'Fluffy', animalCategory: 'cat', details: 'Healthy and vaccinated.' },
		{ name: 'Barkley', animalCategory: 'dog', details: 'Requires daily exercise.' }
	];
	const guardian = {
        name: 'John Doe',
        relationship: 'Brother',
        phone: '555-1234',
        postalAddress: '123 Main St, City, Country',
        email: 'johndoe@example.com'
      };
      
      const childrens = 'Yes';
      
      const exclusions = [
        {
          name: 'Jane Doe',
          relationship: 'Distant Relative',
          reason: 'Estranged relationship'
        },
        {
          name: 'Mark Doe',
          relationship: 'Former Business Partner',
          reason: 'Disagreement over finances'
        },
        // More exclusions can be added dynamically
      ];
      
	const petGuardian = {
		name: 'samuel bastian',
		phone: '555-1234',
		email: 'johndoe@example.com'
	};
    // mention all templates that we want to include in pdf
	const templateNames = ['index','children-guardian', 'pet'];

	try {
		const browser = await puppeteer.launch({
			args: ['--no-sandbox', '--disable-setuid-sandbox']
		});
		const page = await browser.newPage();
		await page.setViewport({ width: 595, height: 842 }); // A4 size in pixels

		let combinedHtml = '';

		for (const templateName of templateNames) {
			const html = jade.renderFile(
				path.join(__dirname, '..', 'views', `${templateName}.jade`),
				{
					principalName: principalName || "John Doe",
					principalCity: principalCity || "New York",
					principalCounty: principalCounty || "New York County",
					state: state || "New York",
					maritalStatus: maritalStatus || "single",
					partnerName: partnerName || "Jane Doe",
					children: children || [{'name': "Sam", "dob": "15-02-2023"},{'name': "akki", "dob": "15-02-2023"}],
					pets,
					petGuardian,
                    guardian,
                    childrens,
                    exclusions
				}
			);

			// Add page break after each template except the last one
			combinedHtml += html + (templateName !== templateNames[templateNames.length - 1] ? '<div style="page-break-after: always;"></div>' : '');
		}

		await page.setContent(combinedHtml, { waitUntil: 'networkidle0' });

		const pdfBuffer = await page.pdf({ 
			format: 'A4',
			printBackground: true,
			margin: { top: '1cm', right: '1cm', bottom: '1cm', left: '1cm' }
		});

		await browser.close();

		// Generate a unique filename
		const filename = `will_${crypto.randomBytes(8).toString('hex')}.pdf`;
		const pdfPath = path.join(__dirname, '..', 'public', 'pdfs', filename);

		// Ensure the directory exists
		await fs.mkdir(path.dirname(pdfPath), { recursive: true });

		// Write the PDF to file
		await fs.writeFile(pdfPath, pdfBuffer);

		// Generate the URL for the PDF
		const pdfUrl = `/pdfs/${filename}`;

		// Send the URL back to the client
		res.json({ url: pdfUrl });

	} catch (error) {
		console.error('Error generating PDF:', error);
		res.status(500).json({ error: 'Error generating PDF: ' + error.message });
	}
};

module.exports = {
	generatePdf
};