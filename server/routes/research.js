import express from 'express';
import xml2js from 'xml2js';

const router = express.Router();

// GET /api/research - Search arXiv research papers
router.get('/', async (req, res) => {
  try {
    const query = req.query.q || 'engineering';
    console.log('Research API called with query:', query);
    const arxivUrl = `https://export.arxiv.org/api/query?search_query=${encodeURIComponent(query)}&start=0&max_results=10`;
    console.log('Fetching from:', arxivUrl);

    const response = await fetch(arxivUrl);
    console.log('Response status:', response.status);

    if (!response.ok) {
      console.error('Failed to fetch data from arXiv API');
      return res.status(500).json({ error: 'Failed to fetch data from arXiv API' });
    }

    const xmlText = await response.text();
    console.log('XML text length:', xmlText.length);
    const parser = new xml2js.Parser();
    const result = await parser.parseStringPromise(xmlText);
    console.log('Parsed result keys:', Object.keys(result));

    const entries = result.feed?.entry || [];
    console.log('Number of entries:', entries.length);

    if (!entries || entries.length === 0) {
      console.log('No entries found');
      return res.json([]);
    }

    const papers = entries.map(entry => {
      const title = entry.title?.[0]?.trim() || '';
      const authors = entry.author?.map(author => author.name?.[0]?.trim()).filter(Boolean) || [];
      const summary = entry.summary?.[0]?.trim().substring(0, 200) + '...' || '';
      
      // Get the link - prefer PDF link, else abstract link
      const links = entry.link || [];
      const pdfLink = links.find(link => link.$.type === 'application/pdf');
      const abstractLink = links.find(link => link.$.type === 'text/html');
      const link = pdfLink?.$.href || abstractLink?.$.href || entry.id?.[0] || '';

      return {
        title,
        authors,
        summary,
        link
      };
    });

    console.log('Returning', papers.length, 'papers');
    res.json(papers);

  } catch (error) {
    console.error('Research API error:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});

export default router;
