const { promises: fs } = require('fs');
import OpenAI from 'openai';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

// Function to fetch eBay sold listings from the website
async function searchItemSalesHistory(searchQuery) {
    console.log('searchQuery', searchQuery);
    const formattedSearchQuery = searchQuery.split(' ').join('+');
    const url = `https://www.ebay.com/sch/i.html?_nkw=${formattedSearchQuery}&LH_Sold=1&LH_Complete=1`;

    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`eBay page request failed: ${response.statusText}`);
    }

    // Accumulate all text in a variable as we read through the stream
    let allText = '';

    // Set up the HTMLRewriter to parse the fetched page
    const rewriter = new HTMLRewriter()
        .on('li', {
            element(el) {},
        })
        .on('li *', {
            // Capture text from all descendants of 'li'
            text(textChunk) {
                // Accumulate all text chunks
                allText += textChunk.text;
            },
        });

    // Read through the entire stream to let HTMLRewriter do its work
    await rewriter.transform(response).text();

    // Split the accumulated text by the 'Sold' keyword and filter out any empty entries
    let rawListings = allText.split(/Sold Item/).filter(text => text.trim() !== '');

    // The split operation removes the 'Sold Item' delimiter, so we add it back to each item except the first entry if it's not a valid listing
    let listings = rawListings.map((text, index) => (index === 0 ? text : `Sold Item${text}`).trim());

    // Filter the array to only include listings that contain the 'Sold' keyword, filter out any eBay announcements, and limit the results to the first 10 listings
    listings = listings
        .filter(listing => listing.includes('Sold'))
        .filter(listing => !listing.includes('eBayAnnouncementsCommunitySecurity'))
        .filter(listing => !listing.includes('ItemsFilter'))
        .slice(0, 10);

    return listings; // Return the filtered listings array
}

// Mock function to call OpenAI GPT-4 Vision Preview (replace with actual implementation)
async function getSearchQueryFromImage(imageUrl, additionalDetails) {
    // This function should call the OpenAI GPT-4 Vision API and process the image and additional details to generate a search string.
    // Implement the API call to OpenAI with the provided imageUrl and additionalDetails and return the search string.

    try {
        const messages = [
            {
                role: 'system',
                content: `You are an expert eBay Search Agent with a knack for finding the best search terms for items based on images.\n
          You will be provided an image and any additional details the user may have provided about the item.\n
          Additional Details (if any): ${additionalDetails}\n
          Based on the image and additional details, you should return the best search term for the item.\n
          Your answer should JUST be the search term in raw text with no explanation as it will be directly plugged into an API. \n
`,
            },
            {
                role: 'user',
                content: [
                    { type: 'text', text: 'Give me the best search term to find the main focus of this image on eBay.' },
                    {
                        type: 'image_url',
                        image_url: {
                            url: imageUrl,
                        },
                    },
                ],
            },
        ];

        const chatCompletion = await openai.chat.completions.create({
            // response_format: { type: 'json_object' }, TODO: Uncomment this line when the API supports JSON output
            messages,
            model: 'gpt-4-vision-preview',
        });

        return chatCompletion.choices[0].message.content;
    } catch (error) {
        console.error(error);
        return new Response('Error calling OpenAI', { status: 500 });
    }
}

// Mock function to select the best listing and suggest a price (replace with actual implementation)
async function getBestListingAndPrice(listings, searchQuery, additionalDetails) {
    // This function should call the OpenAI GPT-4 Turbo API with the eBay listings and return the best listing and a suggested price.
    // Implement the API call to OpenAI with the provided listings array.
    try {
        const messages = [
            {
                role: 'system',
                content: `
You are an expert eBay Reseller Agent with a knack for appraisal based on recent comparable item sales.\n
You will be provided recently sold eBay listings for the searchQuery: ${searchQuery}\n 
The user may have provided additional details about the item which would be helpful in the appraisal.\n
Additional Details (if any): ${additionalDetails}\n
Based on the recently sold listings, you should return the appraised price at which the user should expect their item to sell for.\n
The json output should contain the following fields:\n
- logic_for_the_appraised_price: a brief description of how and why you came up with this price based off the listings \n
- appraised_price: the appraised price of the item\n
`,
            },
            {
                role: 'user',
                content: `## Sold Listing \n${listings.map(listing => listing).join('## Sold Listing \n')})}`,
            },
        ];

        const chatCompletion = await openai.chat.completions.create({
            response_format: { type: 'json_object' },
            messages,
            model: 'gpt-4-1106-preview',
        });

        const output = chatCompletion.choices[0].message.content;

        const parsedOutput = JSON.parse(output);

        return {
            logic_for_the_appraised_price: parsedOutput.logic_for_the_appraised_price,
            appraised_price: parsedOutput.appraised_price,
        };
    } catch (error) {
        console.log('Error calling OpenAI');
        console.error(error);
    }
}

// Function to handle the /search endpoint
async function handleSearchRequest(req) {
    const { imageUrl, additionalDetails } = await req.json();

    const searchTerm = await getSearchQueryFromImage(imageUrl, additionalDetails);

    const listings = await searchItemSalesHistory(searchTerm);

    const finalResult = await getBestListingAndPrice(listings, searchTerm, additionalDetails);

    return new Response(JSON.stringify({ ...finalResult }), {
        status: 200,
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
        },
    });
}

// Function to handle OPTIONS request for CORS preflight
function handleOptionsRequest() {
    return new Response(null, {
        status: 204, // No Content
        headers: {
            'Access-Control-Allow-Origin': '*', // Allow all origins
            'Access-Control-Allow-Methods': 'POST, GET, OPTIONS', // Allowed request methods
            'Access-Control-Allow-Headers': 'Content-Type, Authorization', // Allowed headers
        },
    });
}

Bun.serve({
    async fetch(req) {
        // Handle preflight CORS OPTIONS request
        if (req.method === 'OPTIONS') {
            return handleOptionsRequest();
        }

        // Handle search requests
        if (req.method === 'POST' && new URL(req.url).pathname === '/search') {
            return handleSearchRequest(req);
        }

        // Serve static files for any other GET request
        if (req.method === 'GET') {
            const urlPath = new URL(req.url).pathname;
            // Determine the correct file path
            let filePath = urlPath === '/' ? './dist/index.html' : `./dist${urlPath}`;

            // Attempt to serve the file
            try {
                // Remove the './dist' prefix when accessing file system
                const fsPath = filePath.slice(2);

                // Check if the file exists using the fsPath without the './dist' prefix
                await fs.stat(fsPath);

                // Serve the file with automatic MIME type detection
                return new Response(Bun.file(filePath));
            } catch (error) {
                // If the file is not found, serve index.html for SPA routing
                if (error.code === 'ENOENT' && !urlPath.startsWith('/api/')) {
                    // Assuming '/api/' is used for API routes
                    return new Response(Bun.file('./dist/index.html'));
                }

                // Log the error for debugging
                console.error(error);

                // Return a 404 response if the file is not found or any other error occurs
                return new Response('Not found', { status: 404 });
            }
        }

        // Handle 404s
        return new Response('Not found', { status: 404 });
    },
});
