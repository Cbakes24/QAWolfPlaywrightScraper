/******* HELPER FUNTIONS *******/

// Function to fix the time format and convert to a javascript date object
export const timeFix = (time) => {
  // console.log("Received time in timeFix:", time, "Type:", typeof time); us this to check if time is a string and if not what it is
  if (typeof time !== "string") {
    console.error("Invalid input to timeFix: Should be receiving an isoString + Unix timestamp", time);
    return null; // Return null for invalid input
  }
  const isoString = time.split(" ")[0]; // Extract ISO string remove the unix
  return new Date(isoString); // Convert to Date object
};


  // Function to check if the timestamps are sorted newest to oldest
  // export const currentArticlesSort = (timeArray, index) => {
  //   for (let i = 1; i < timeArray.length; i++) {
  //     if (timeArray[i] > timeArray[i - 1]) {
  //       console.log(" Article timestamps are not sorted correctly from newest to oldest.");
  //       return false; // If any timestamp is newer than the previous one, it's not sorted
  //     }
  //   }
  //   console.log("All timestamps are sorted correctly from newest to oldest.");
  //   return true; // All timestamps are 
    
  // };


// Function to check if the current pagesarticles are sorted newest to oldest
  export const currentArticlesSort = (articles, timeFix) => {
    for (let i = 1; i < articles.length; i++) {
      // console.log("Current article date:", articles[i].date); 
      const current = articles[i].date;
      const previous = articles[i - 1].date;
  
      if (current > previous) {
        console.error(
          `Timestamps are not sorted correctly: "${articles[i].title}" (current: ${articles[i].date}) is newer than "${articles[i - 1].title}" (previous: ${articles[i - 1].date})`
        );
        return false; // Articles are not sorted
      }
    }
    console.log("All current timestamps are sorted correctly from newest to oldest.");
    return true; // Articles are sorted
  }

  // Function to check if the articles have null timestamps
  export const nullArticlesTest = (articles) => {
    for (let i = 0; i < articles.length; i++) {
      if (articles[i].date === null || typeof articles[i].date !== "string") {
        console.error(
          `Timestamp is null for article: "${articles[i].title}" at index ${i}`
        );
        return false; // Articles are not sorted
      }
    }
    console.log("All current timestamps are not null.");
    return true; // Articles are sorted
  };
  
  // module.exports = {timeFix, currentArticlesSort, currentArticlesSort, nullArticlesTest};
// export default {timeFix, currentArticlesSort, currentArticlesSort, nullArticlesTest}; 
