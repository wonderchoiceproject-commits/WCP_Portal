const supabaseUrl = 'https://ouflqodgegugznmmlkpt.supabase.co/rest/v1/books';
const headers = {
    'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im91Zmxxb2RnZWd1Z3pubW1sa3B0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4ODEyNDkxMiwiZXhwIjoyMTAzNzAwOTEyfQ.HrFGGMUDAxgtVQ5M6psk6EsVcheU6cL-0jYtrQLOn3U',
    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im91Zmxxb2RnZWd1Z3pubW1sa3B0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4ODEyNDkxMiwiZXhwIjoyMTAzNzAwOTEyfQ.HrFGGMUDAxgtVQ5M6psk6EsVcheU6cL-0jYtrQLOn3U',
    'Content-Type': 'application/json'
};

function isbn13To10(isbn13) {
    if (isbn13.length !== 13 || !isbn13.startsWith('978')) return null;
    const core = isbn13.substring(3, 12);
    let sum = 0;
    for (let i = 0; i < 9; i++) {
        sum += parseInt(core[i]) * (10 - i);
    }
    const rem = sum % 11;
    const check = 11 - rem;
    let checkDigit = check === 10 ? 'X' : (check === 11 ? '0' : check.toString());
    return core + checkDigit;
}

async function run() {
    const res = await fetch(supabaseUrl + '?select=id,title,coverImage', { headers });
    const books = await res.json();
    let updated = 0;
    
    for (const book of books) {
        const needsUpdate = !book.coverImage || 
                            book.coverImage.includes('picsum.photos') || 
                            book.coverImage === '' || 
                            book.coverImage.includes('ndlsearch') || 
                            book.coverImage.includes('rakuten');
                            
        if (needsUpdate) {
            const cleanTitle = book.title.replace(/[①-⑳\(\)0-9]/g, '').trim();
            console.log('Searching NDL for:', cleanTitle);
            
            try {
                const ndlRes = await fetch('https://ndlsearch.ndl.go.jp/api/opensearch?title=' + encodeURIComponent(cleanTitle));
                const xmlText = await ndlRes.text();
                const isbns = [...xmlText.matchAll(/<dc:identifier[^>]*ISBN[^>]*>([0-9X\-]+)<\/dc:identifier>/ig)];
                
                let foundIsbn13 = null;
                for (const match of isbns) {
                    const cleanIsbn = match[1].replace(/-/g, '');
                    if (cleanIsbn.length === 13 && cleanIsbn.startsWith('978')) {
                        foundIsbn13 = cleanIsbn;
                        break;
                    }
                }
                
                if (foundIsbn13) {
                    const isbn10 = isbn13To10(foundIsbn13);
                    if (isbn10) {
                        const thumbUrl = 'https://images-na.ssl-images-amazon.com/images/P/' + isbn10 + '.09.LZZZZZZZ.jpg';
                        console.log(' Found Amazon thumbnail:', thumbUrl);
                        
                        await fetch(supabaseUrl + '?id=eq.' + book.id, {
                            method: 'PATCH',
                            headers,
                            body: JSON.stringify({ coverImage: thumbUrl })
                        });
                        updated++;
                    }
                } else {
                    console.log(' No ISBN-13 found.');
                }
            } catch(e) {
                console.log(' Error:', e.message);
            }
            await new Promise(r => setTimeout(r, 400));
        }
    }
    console.log('Done! Updated ' + updated + ' books.');
}
run();
