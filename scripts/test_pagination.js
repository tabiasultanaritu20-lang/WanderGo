async function testPagination() {
  try {
    // 1. Seed some data if needed (assuming there are spots, otherwise seed)
    // For this test, we assume there are at least 4 spots to test pagination with limit 3
    
    // 2. Request Page 1
    console.log("Testing Page 1...");
    const res1 = await fetch('http://localhost:8080/api/spots?limit=3&page=1');
    const data1 = await res1.json();
    console.log("Page 1 Data Length:", data1.data.length);
    console.log("Page 1 Page:", data1.page);
    console.log("Page 1 Total Pages:", data1.totalPages);

    if (data1.data.length > 3) {
      console.error("FAIL: Page 1 returned more than 3 items");
    }

    // 3. Request Page 2
    console.log("\nTesting Page 2...");
    const res2 = await fetch('http://localhost:8080/api/spots?limit=3&page=2');
    const data2 = await res2.json();
    console.log("Page 2 Data Length:", data2.data.length);
    console.log("Page 2 Page:", data2.page);
    
    if (data1.data.length > 0 && data2.data.length > 0 && data1.data[0]._id === data2.data[0]._id) {
       console.warn("WARNING: Page 1 and Page 2 first item is the same. Check if there are enough items or sort order.");
    } else {
       console.log("SUCCESS: Page 1 and Page 2 content differs.");
    }

  } catch (error) {
    console.error("Error testing pagination:", error.message);
  }
}

testPagination();