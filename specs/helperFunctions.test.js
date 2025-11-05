import { expect } from "chai";
import {
  timeFix,
  currentArticlesSort,
  nullArticlesTest,
} from "../helperFunctions.js";

describe("timeFix", () => {
    it("should convert ISO strings + Unix timestamps from the title element to JavaScript Date objects", () => {
      const isoString = "2024-12-04T19:30:36 1733340636";
      const result = timeFix(isoString);
      console.log(result, "result with TIMEFIX");
      expect(result).to.be.a("date");

    });
});
  

  // describe("currentArticlesSort", () => {
  //   it("should return true for correctly sorted timestamps (newest to oldest)", () => {
  //     const timestamps = [
  //       new Date("2024-12-04T15:00:00Z"),
  //       new Date("2024-12-04T14:00:00Z"),
  //       new Date("2024-12-04T13:00:00Z"),
  //     ];
  //     const result = currentArticlesSort(timestamps);
  //     expect(result).to.be.true;
  //   });
  
  //   it("should return false for unsorted timestamps", () => {
  //     const timestamps = [
  //       new Date("2024-12-04T14:00:00Z"),
  //       new Date("2024-12-04T15:00:00Z"), // Newer comes after older
  //       new Date("2024-12-04T13:00:00Z"),
  //     ];
  //     const result = currentArticlesSort(timestamps);
  //     expect(result).to.be.false;
  //   });
  
  //   it("should handle an empty array gracefully", () => {
  //     const result = currentArticlesSort([]);
  //     expect(result).to.be.true; // An empty array is technically sorted
  //   });
  // });
  

  describe("currentArticlesSort", () => {
    it("should return true for sorted articles by date (newest to oldest)", () => {
      const articles = [
        { date: "2024-12-04T15:00:00Z", title: "Article 1", id: "1", user: "user1", submitted: "submitted1", url: "url1" },
        { date: "2024-12-04T14:00:00Z", title: "Article 2", id: "2", user: "user2", submitted: "submitted2", url: "url2" },
        { date: "2024-12-04T13:00:00Z", title: "Article 3", id: "3", user: "user3", submitted: "submitted3", url: "url3" },
      ];
      const result = currentArticlesSort(articles);
      expect(result).to.be.true;
    });
  
    it("should return false for unsorted articles by date", () => {
      const articles = [
        { date: "2024-12-04T14:00:00Z", title: "Article 1", id: "1", user: "user1", submitted: "submitted1", url: "url1" },
        { date: "2024-12-04T15:00:00Z", title: "Article 2", id: "2", user: "user2", submitted: "submitted2", url: "url2" }, // Out of order
        { date: "2024-12-04T13:00:00Z", title: "Article 3", id: "3", user: "user3", submitted: "submitted3", url: "url3" },
      ];
      const result = currentArticlesSort(articles);
      expect(result).to.be.false;
    });
  });
  

  describe("nullArticlesTest", () => {
    it("should return true if no articles have null timestamps", () => {
      const articles = [
        { date: "2024-12-04T15:00:00Z", title: "Article 1" },
        { date: "2024-12-04T14:00:00Z", title: "Article 2" },
        { date: "2024-12-04T13:00:00Z", title: "Article 3" },
      ];
      const result = nullArticlesTest(articles);
      expect(result).to.be.true;
    });
  
    it("should return false if any article has a null timestamp", () => {
      const articles = [
        { date: "2024-12-04T15:00:00Z", title: "Article 1" },
        { date: null, title: "Article 2" }, // Null timestamp
        { date: "2024-12-04T13:00:00Z", title: "Article 3" },
      ];
      const result = nullArticlesTest(articles);
      expect(result).to.be.false;
    });
    // it("should return false if any article has anything but a sting as a timestamp", () => {
    //   const articles = [
    //     { date: "2024-12-04T15:00:00Z", title: "Article 1" },
    //     { date: 123, title: "Article 2" }, // Null timestamp
    //     { date: "2024-12-04T13:00:00Z", title: "Article 3" },
    //   ];
    //   const result = nullArticlesTest(articles);
    //   console.log(result, "result with NULLARTICLESTEST");
    //   expect(result).to.be.null;
    // });
  });
  