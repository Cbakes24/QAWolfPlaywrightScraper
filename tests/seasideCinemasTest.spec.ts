import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('https://www.seasidecinemas.com');
});

test('get book now link home', async ({ page }) => {
  // Wait for page to load
  await page.waitForLoadState('domcontentloaded');
  
  // Handle the modal popup if it appears (End of Summer Sale modal)
  // Wait for modal to potentially appear, then close it
  try {
    // Look for the "Check Later" button first (most reliable)
    const checkLaterButton = page.getByRole('button', { name: /Check Later/i });
    await checkLaterButton.click({ timeout: 3000 });
    await page.waitForTimeout(300); // Wait for modal animation to complete
  } catch (error) {
    // If "Check Later" button not found, try to find and click the close (X) button
    try {
      // Look for common close button selectors
      const closeButton = page.locator('button:has-text("×"), button[aria-label*="close" i], [class*="close"][class*="button"], [class*="modal"][class*="close"]').first();
      if (await closeButton.isVisible({ timeout: 2000 }).catch(() => false)) {
        await closeButton.click();
        await page.waitForTimeout(300);
      }
    } catch (closeError) {
      // Modal might not appear or already closed, continue with test
      console.log('Modal not found or already closed, continuing with test...');
    }
  }
  
  // Click the Book Now button - using a more specific selector
  await page.getByRole('link', { name: 'Book Now!' }).click();

  // Wait for navigation and expect the booking page heading
  await expect(page.getByRole('heading', { name: 'Book Your Experience' })).toBeVisible();
});

test('complete booking form submission home', async ({ page }) => {
  // Navigate to booking page
  // Wait for the page to load
  // Select an experience (Classic)
  // Fill out required customer information
  // Fill occasion type
  // Correct date format
  // Set date and time
  // Correct time format (if HTML input is type="time")
  // Set guest count (using nth beauce playwright gets confused because there are 2 guest count entiry points so were using the first one to enter the guest amount)
  // await page.getByLabel('👥 Number of Guests *').fill('2');
  // Submit the booking
  // Wait for and verify the success message  
await page.goto('https://www.seasidecinemas.com/book');
await page.waitForLoadState('domcontentloaded');
await page.getByRole('button', { name: 'Classic' }).click();
await page.getByRole('button', { name: 'Bali' }).click();
await page.getByPlaceholder('Enter your full name').fill('Cory Baker');
await page.locator('select[name="howHeard"]').selectOption('Instagram');
await page.getByPlaceholder('(555) 123-4567').fill('7814920313');
await page.getByPlaceholder('your@email.com').fill('cory@seasidecinemasTEST.com');
await page.locator('input[type="date"]').fill('2025-07-16');
await page.locator('[type="time"]').fill('16:45'); // 24-hr format
await page.locator('select[name="type"]').selectOption('iphone');
await page.locator('input[type="number"][min="2"]').nth(0).fill('4');
await page.getByRole('button', { name: /Submit Booking/ }).click();
await expect(page.locator('text=🎉 Success! Your booking has been submitted. Thank you for choosing us! 🎬')).toBeVisible();
});

//Discount Code Autumn25
  test('complete booking form submission with a discount code', async ({ page }) => {
    // Navigate to booking page
    // Wait for the page to load
    // Select an experience (Classic)
    // Fill out required customer information
    // Fill occasion type
    // Correct date format
    // Set date and time
    // Correct time format (if HTML input is type="time")
    // Set guest count (using nth beauce playwright gets confused because there are 2 guest count entiry points so were using the first one to enter the guest amount)
    // await page.getByLabel('👥 Number of Guests *').fill('2');
    // Submit the booking
    // Wait for and verify the success message  
  await page.goto('https://www.seasidecinemas.com/book');
  await page.waitForLoadState('domcontentloaded');
  await page.getByRole('button', { name: 'Classic' }).click();
  await page.getByRole('button', { name: 'Bali' }).click();
  await page.getByPlaceholder('Enter discount code').fill('Autumn25');
  await page.getByRole('button', { name: 'Apply' }).click();
  await expect(page.locator('text=🎉 Discount Applied: AUTUMN25')).toBeVisible();
  await expect(page.locator('text=-$35')).toBeVisible();
  await page.getByPlaceholder('Enter your full name').fill('Cory Baker');
  await page.locator('select[name="howHeard"]').selectOption('Instagram');
  await page.getByPlaceholder('(555) 123-4567').fill('7814920313');
  await page.getByPlaceholder('your@email.com').fill('cory@seasidecinemasTEST.com');
  await page.locator('input[type="date"]').fill('2025-07-16');
  await page.locator('[type="time"]').fill('16:45'); // 24-hr format
  await page.locator('select[name="type"]').selectOption('iphone');
  await page.locator('input[type="number"][min="2"]').nth(0).fill('4');
  await page.getByRole('button', { name: /Submit Booking/ }).click();
  await expect(page.locator('text=🎉 Success! Your booking has been submitted. Thank you for choosing us! 🎬')).toBeVisible();
  });
  
  

//Seasonal Package
test('complete booking form submission sesonal package', async ({ page }) => {
  // Navigate to booking page
  // Wait for the page to load
  // Select an experience (Classic)
  // Fill out required customer information
  // Fill occasion type
  // Correct date format
  // Set date and time
  // Correct time format (if HTML input is type="time")
  // Set guest count (using nth beauce playwright gets confused because there are 2 guest count entiry points so were using the first one to enter the guest amount)
  // await page.getByLabel('👥 Number of Guests *').fill('2');
  // Submit the booking
  // Wait for and verify the success message  
await page.goto('https://www.seasidecinemas.com/book');
await page.waitForLoadState('domcontentloaded');
await page.getByRole('button', { name: 'Classic' }).click();
await page.getByRole('button', { name: 'Seasonal' }).click();
await page.getByRole('button', { name: 'Select a holiday theme' }).click();
await page.getByRole('button', { name: 'Holiday Magic' }).click();
await page.getByPlaceholder('Enter your full name').fill('Cory Baker');
await page.locator('select[name="howHeard"]').selectOption('Instagram');
await page.getByPlaceholder('(555) 123-4567').fill('7814920313');
await page.getByPlaceholder('your@email.com').fill('cory@seasidecinemasTEST.com');
await page.locator('input[type="date"]').fill('2025-07-16');
await page.locator('[type="time"]').fill('16:45'); // 24-hr format
await page.locator('select[name="type"]').selectOption('iphone');
await page.locator('input[type="number"][min="2"]').nth(0).fill('4');
await page.getByRole('button', { name: /Submit Booking/ }).click();
await expect(page.locator('text=🎉 Success! Your booking has been submitted. Thank you for choosing us! 🎬')).toBeVisible();
});

// Video Playback Tests for Alt Home Page
test.describe('Video Playback Tests - Alt Home', () => {
  test('should detect video element and check playback state on alt home', async ({ page }) => {
    // Wait for the page to load
    await page.waitForLoadState('domcontentloaded');
    
    // Find video element that contains source with LoveBoat3.mp4
    // Use evaluate to find the video element that has the source
    const videoElement = page.locator('video').filter({
      has: page.locator('source[src="/LoveBoat3.mp4"]')
    });
    await expect(videoElement).toBeVisible();
    
    // Get video properties
    const videoPoster = await videoElement.getAttribute('poster');
    const videoAutoplay = await videoElement.getAttribute('autoplay');
    const videoMuted = await videoElement.getAttribute('muted');
    const videoLoop = await videoElement.getAttribute('loop');
    
    // Get the source src from the nested source element
    const sourceElement = videoElement.locator('source[src="/LoveBoat3.mp4"]');
    const videoSrc = await sourceElement.getAttribute('src');
    
    console.log('Alt Home Video Properties:', {
      src: videoSrc,
      poster: videoPoster,
      autoplay: videoAutoplay,
      muted: videoMuted,
      loop: videoLoop
    });
    
    // Check if video has the correct source
    expect(videoSrc).toBe('/LoveBoat3.mp4');
    
    // Check if autoplay is enabled
    expect(videoAutoplay).toBeDefined();
    
    // Check if muted is enabled (required for autoplay)
    expect(videoMuted).toBeDefined();
  });

  test('should check video playback state after page load', async ({ page }) => {
    await page.waitForLoadState('domcontentloaded');
    
    // Find video element that contains source with LoveBoat3.mp4
    const videoElement = page.locator('video').filter({
      has: page.locator('source[src="/LoveBoat3.mp4"]')
    });
    await expect(videoElement).toBeVisible();
    
    // Wait a bit for video to potentially start playing
    await page.waitForTimeout(2000);
    
    // Check video ready state - use elementHandle() to get a serializable handle
    const videoHandle = await videoElement.elementHandle();
    const readyState = await page.evaluate((video) => {
      const vid = video as HTMLVideoElement;
      return {
        readyState: vid.readyState,
        paused: vid.paused,
        currentTime: vid.currentTime,
        duration: vid.duration,
        networkState: vid.networkState,
        error: vid.error ? vid.error.message : null
      };
    }, videoHandle);
    
    console.log('Alt Home Video Playback State:', readyState);
    
    // Check if video has loaded metadata
    expect(readyState.readyState).toBeGreaterThan(0);
    
    // Check if video is not paused (should be playing due to autoplay)
    // Note: On mobile, autoplay might be blocked, so this could be paused
    if (readyState.paused) {
      console.log('⚠️ Alt Home Video is paused - this might indicate autoplay was blocked');
    } else {
      console.log('✅ Alt Home Video is playing');
    }
    
    // Check if video has duration (indicates it loaded successfully)
    expect(readyState.duration).toBeGreaterThan(0);
  });

  test('should test mobile-specific video behavior on alt home', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.waitForLoadState('domcontentloaded');
    
    // Find video element that contains source with LoveBoat3.mp4
    const videoElement = page.locator('video').filter({
      has: page.locator('source[src="/LoveBoat3.mp4"]')
    });
    await expect(videoElement).toBeVisible();
    
    // Wait longer on mobile for video to load
    await page.waitForTimeout(5000);
    
    // Check mobile-specific video state - use elementHandle() to get a serializable handle
    const videoHandle = await videoElement.elementHandle();
    const mobileVideoState = await page.evaluate((video) => {
      const vid = video as HTMLVideoElement;
      
      return {
        readyState: vid.readyState,
        paused: vid.paused,
        currentTime: vid.currentTime,
        duration: vid.duration,
        networkState: vid.networkState,
        playsInline: vid.playsInline,
        webkitSupportsFullscreen: 'webkitSupportsFullscreen' in vid,
        canPlayType: vid.canPlayType('video/mp4')
      };
    }, videoHandle);
    
    console.log('Alt Home Mobile Video State:', mobileVideoState);
    
    // Check if video supports inline playback (important for mobile)
    expect(mobileVideoState.playsInline).toBe(true);
    
    // Check if video can play MP4 format
    expect(mobileVideoState.canPlayType).toBeTruthy();
    
    // Log whether video appears to be playing or static
    if (mobileVideoState.currentTime > 0 && !mobileVideoState.paused) {
      console.log('✅ Alt Home Video appears to be playing on mobile');
    } else if (mobileVideoState.currentTime === 0 && mobileVideoState.paused) {
      console.log('⚠️ Alt Home Video appears to be static/paused on mobile');
    } else {
      console.log('❓ Alt Home Video state unclear on mobile');
    }
  });
});

//FROM GPT

// test('should submit a booking successfully', async ({ page }) => {
//   // Go to homepage
//   await page.goto('https://www.seasidecinemas.com/');

//   // Click the main "Book Now!" button
//   await page.goto('https://www.seasidecinemas.com/althome');
//   await page.getByRole('link', { name: /Book Now/i }).nth(0).click();

//   // Wait for the heading on the booking page
//   await expect(page.getByRole('heading', { name: /Book Your Experience/i })).toBeVisible();

//   // Select experience (pick a visible button/dropdown item)
//   await page.getByRole('button', { name: /Classic/i }).click();
//   await page.getByRole('button', { name: /Bali/i }).click();

//   // Fill in form fields
//   await page.getByLabel('Full Name *').fill('Test User');
//   await page.getByLabel('How did you hear about us? *').fill('Google');
//   await page.getByLabel('Email *').fill('test@example.com');
//   await page.getByLabel('Phone Number *').fill('555-123-4567');
//   await page.getByLabel('Type Of Phone *').selectOption('iphone');
//   await page.getByLabel('Occasion Type *').fill('Birthday');
//   await page.getByLabel('Preferred Date *').fill('2025-12-25');
//   await page.getByLabel('Start Time *').fill('18:00');
//   await page.getByLabel('👥 Number of Guests *').fill('4');

//   // Submit the form
//   await page.getByRole('button', { name: /Submit Booking/i }).click();

//   // Expect success toast to appear
//   await expect(page.locator('text=🎉 Success! Your booking has been submitted')).toBeVisible();
// });
