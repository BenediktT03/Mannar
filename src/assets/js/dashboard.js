 /**
 * Dashboard - Statistics Tracking and Reporting Module
 * Provides functionality for tracking website usage, visualizing statistics,
 * and exporting data in various formats.
 */

const Dashboard = (function() {
  // Private variables
  let db;
  let auth;
  let storage;
  let chartInstances = {};
  let statsCache = {
    pageViews: {},
    userActivity: {},
    popularPages: [],
    lastUpdated: null
  };

  // DOM Elements
  const elements = {};

  // Date formatting helper
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('de-DE', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  // Initialize dashboard
  function init() {
    console.log('Initializing Dashboard module...');
    
    // Initialize Firebase references
    if (typeof firebase !== 'undefined') {
      db = firebase.firestore();
      auth = firebase.auth();
      if (firebase.storage) {
        storage = firebase.storage();
      }
    } else {
      console.error('Firebase not found. Dashboard functionality will be limited.');
      showStatus('Firebase not initialized. Some features may not work properly.', true);
      return;
    }
    
    // Cache DOM elements
    cacheElements();
    
    // Setup event listeners
    setupEventListeners();
    
    // Load initial data
    loadStatistics();
    
    // Setup data refresh interval (every 5 minutes)
    setInterval(refreshData, 5 * 60 * 1000);
    
    console.log('Dashboard module initialized');
  }
  
  // Cache DOM elements for faster access
  function cacheElements() {
    elements.statsContainer = document.getElementById('statisticsContainer');
    elements.pageViewsChart = document.getElementById('pageViewsChart');
    elements.userActivityChart = document.getElementById('userActivityChart');
    elements.popularPagesContainer = document.getElementById('popularPagesContainer');
    elements.lastUpdatedSpan = document.getElementById('lastUpdatedTime');
    elements.refreshStatsBtn = document.getElementById('refreshStatsBtn');
    elements.exportCSVBtn = document.getElementById('exportCSVBtn');
    elements.exportExcelBtn = document.getElementById('exportExcelBtn');
    elements.dateRangeSelector = document.getElementById('dateRangeSelector');
    elements.customStartDate = document.getElementById('customStartDate');
    elements.customEndDate = document.getElementById('customEndDate');
    elements.loadingIndicator = document.getElementById('statsLoadingIndicator');
  }
  
  // Set up event listeners
  function setupEventListeners() {
    // Refresh button
    if (elements.refreshStatsBtn) {
      elements.refreshStatsBtn.addEventListener('click', function() {
        refreshData(true); // Force refresh
      });
    }
    
    // Export buttons
    if (elements.exportCSVBtn) {
      elements.exportCSVBtn.addEventListener('click', function() {
        exportData('csv');
      });
    }
    
    if (elements.exportExcelBtn) {
      elements.exportExcelBtn.addEventListener('click', function() {
        exportData('excel');
      });
    }
    
    // Date range selector
    if (elements.dateRangeSelector) {
      elements.dateRangeSelector.addEventListener('change', function() {
        const range = this.value;
        
        // Show/hide custom date inputs
        if (range === 'custom') {
          document.getElementById('customDateContainer').style.display = 'block';
        } else {
          document.getElementById('customDateContainer').style.display = 'none';
          refreshData(true); // Reload with new date range
        }
      });
    }
    
    // Custom date inputs
    if (elements.customStartDate && elements.customEndDate) {
      elements.customStartDate.addEventListener('change', updateCustomDateRange);
      elements.customEndDate.addEventListener('change', updateCustomDateRange);
    }
  }
  
  // Update statistics when custom date range changes
  function updateCustomDateRange() {
    const startDate = elements.customStartDate.value;
    const endDate = elements.customEndDate.value;
    
    if (startDate && endDate) {
      refreshData(true); // Reload with custom date range
    }
  }
  
  // Show loading state
  function showLoading(show = true) {
    if (elements.loadingIndicator) {
      elements.loadingIndicator.style.display = show ? 'block' : 'none';
    }
    
    if (elements.refreshStatsBtn) {
      elements.refreshStatsBtn.disabled = show;
    }
  }
  
  // Load statistics data
  function loadStatistics() {
    showLoading(true);
    
    // Get date range
    const dateRange = getSelectedDateRange();
    
    // Load page views
    loadPageViews(dateRange.startDate, dateRange.endDate)
      .then(() => loadUserActivity(dateRange.startDate, dateRange.endDate))
      .then(() => loadPopularPages(dateRange.startDate, dateRange.endDate))
      .then(() => {
        // Update last updated time
        statsCache.lastUpdated = new Date();
        if (elements.lastUpdatedSpan) {
          elements.lastUpdatedSpan.textContent = statsCache.lastUpdated.toLocaleTimeString();
        }
        
        // Render charts and data
        renderPageViewsChart();
        renderUserActivityChart();
        renderPopularPages();
        
        showLoading(false);
      })
      .catch(error => {
        console.error('Error loading statistics:', error);
        showStatus('Error loading statistics: ' + error.message, true);
        showLoading(false);
      });
  }
  
  // Get selected date range
  function getSelectedDateRange() {
    const now = new Date();
    let startDate, endDate = now;
    
    // If date range selector exists
    if (elements.dateRangeSelector) {
      const range = elements.dateRangeSelector.value;
      
      switch (range) {
        case 'today':
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          break;
        case 'yesterday':
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
          endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          break;
        case 'last7days':
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
          break;
        case 'last30days':
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 30);
          break;
        case 'thisMonth':
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        case 'lastMonth':
          startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
          endDate = new Date(now.getFullYear(), now.getMonth(), 0);
          break;
        case 'custom':
          if (elements.customStartDate && elements.customStartDate.value) {
            startDate = new Date(elements.customStartDate.value);
          } else {
            startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 30);
          }
          
          if (elements.customEndDate && elements.customEndDate.value) {
            endDate = new Date(elements.customEndDate.value);
          }
          break;
        default:
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 30);
      }
    } else {
      // Default: last 30 days
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 30);
    }
    
    return {
      startDate: startDate,
      endDate: endDate
    };
  }
  
  // Load page views data
  function loadPageViews(startDate, endDate) {
    return new Promise((resolve, reject) => {
      // If we're using Firebase, query the analytics collection
      if (db) {
        db.collection('analytics')
          .doc('pageViews')
          .collection('daily')
          .where('date', '>=', startDate)
          .where('date', '<=', endDate)
          .orderBy('date', 'asc')
          .get()
          .then(snapshot => {
            const pageViews = {};
            
            snapshot.forEach(doc => {
              const data = doc.data();
              const dateStr = formatDate(data.date.toDate());
              pageViews[dateStr] = data.count || 0;
            });
            
            statsCache.pageViews = pageViews;
            resolve();
          })
          .catch(error => {
            console.error('Error loading page views:', error);
            
            // Use demo data if error occurs
            statsCache.pageViews = generateDemoData('pageViews', startDate, endDate);
            resolve();
          });
      } else {
        // Generate demo data if Firebase is not available
        statsCache.pageViews = generateDemoData('pageViews', startDate, endDate);
        resolve();
      }
    });
  }
  
  // Load user activity data
  function loadUserActivity(startDate, endDate) {
    return new Promise((resolve, reject) => {
      // If we're using Firebase, query the analytics collection
      if (db) {
        db.collection('analytics')
          .doc('userActivity')
          .collection('daily')
          .where('date', '>=', startDate)
          .where('date', '<=', endDate)
          .orderBy('date', 'asc')
          .get()
          .then(snapshot => {
            const userActivity = {};
            
            snapshot.forEach(doc => {
              const data = doc.data();
              const dateStr = formatDate(data.date.toDate());
              userActivity[dateStr] = {
                sessions: data.sessions || 0,
                edits: data.edits || 0,
                logins: data.logins || 0
              };
            });
            
            statsCache.userActivity = userActivity;
            resolve();
          })
          .catch(error => {
            console.error('Error loading user activity:', error);
            
            // Use demo data if error occurs
            statsCache.userActivity = generateDemoData('userActivity', startDate, endDate);
            resolve();
          });
      } else {
        // Generate demo data if Firebase is not available
        statsCache.userActivity = generateDemoData('userActivity', startDate, endDate);
        resolve();
      }
    });
  }
  
  // Load popular pages data
  function loadPopularPages(startDate, endDate) {
    return new Promise((resolve, reject) => {
      // If we're using Firebase, query the analytics collection
      if (db) {
        db.collection('analytics')
          .doc('popularPages')
          .collection('aggregate')
          .orderBy('views', 'desc')
          .limit(10)
          .get()
          .then(snapshot => {
            const popularPages = [];
            
            snapshot.forEach(doc => {
              const data = doc.data();
              popularPages.push({
                pageId: doc.id,
                title: data.title || doc.id,
                views: data.views || 0,
                lastViewed: data.lastViewed ? data.lastViewed.toDate() : null
              });
            });
            
            statsCache.popularPages = popularPages;
            resolve();
          })
          .catch(error => {
            console.error('Error loading popular pages:', error);
            
            // Use demo data if error occurs
            statsCache.popularPages = generateDemoData('popularPages');
            resolve();
          });
      } else {
        // Generate demo data if Firebase is not available
        statsCache.popularPages = generateDemoData('popularPages');
        resolve();
      }
    });
  }
  
  // Generate demo data for testing
  function generateDemoData(type, startDate, endDate) {
    switch (type) {
      case 'pageViews':
        return generateDateRangeData(startDate, endDate, () => Math.floor(Math.random() * 100) + 50);
        
      case 'userActivity':
        return generateDateRangeData(startDate, endDate, () => ({
          sessions: Math.floor(Math.random() * 50) + 10,
          edits: Math.floor(Math.random() * 20) + 5,
          logins: Math.floor(Math.random() * 10) + 2
        }));
        
      case 'popularPages':
        const pages = [
          { pageId: 'index', title: 'Home' },
          { pageId: 'about', title: 'About' },
          { pageId: 'services', title: 'Services' },
          { pageId: 'contact', title: 'Contact' },
          { pageId: 'blog', title: 'Blog' },
          { pageId: 'portfolio', title: 'Portfolio' },
          { pageId: 'testimonials', title: 'Testimonials' },
          { pageId: 'gallery', title: 'Gallery' },
          { pageId: 'faq', title: 'FAQ' },
          { pageId: 'pricing', title: 'Pricing' }
        ];
        
        return pages.map(page => ({
          ...page,
          views: Math.floor(Math.random() * 1000) + 100,
          lastViewed: new Date(Date.now() - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000))
        }));
    }
  }
  
  // Generate data for a date range
  function generateDateRangeData(startDate, endDate, valueGenerator) {
    const data = {};
    const currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
      const dateStr = formatDate(currentDate);
      data[dateStr] = valueGenerator();
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return data;
  }
  
  // Render page views chart
  function renderPageViewsChart() {
    if (!elements.pageViewsChart) return;
    
    // If Chart.js is not available, show error
    if (typeof Chart === 'undefined') {
      elements.pageViewsChart.innerHTML = '<div class="w3-panel w3-pale-red"><p>Chart.js is required to display this chart.</p></div>';
      return;
    }
    
    // Prepare data
    const labels = Object.keys(statsCache.pageViews).sort();
    const data = labels.map(label => statsCache.pageViews[label]);
    
    // Destroy existing chart if it exists
    if (chartInstances.pageViews) {
      chartInstances.pageViews.destroy();
    }
    
    // Create chart
    const ctx = elements.pageViewsChart.getContext('2d');
    chartInstances.pageViews = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: 'Page Views',
          data: data,
          backgroundColor: 'rgba(52, 152, 219, 0.2)',
          borderColor: 'rgba(52, 152, 219, 1)',
          borderWidth: 2,
          tension: 0.4,
          pointBackgroundColor: 'rgba(52, 152, 219, 1)',
          pointRadius: 3,
          pointHoverRadius: 5
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: 'Daily Page Views',
            font: {
              size: 16
            }
          },
          tooltip: {
            mode: 'index',
            intersect: false
          },
          legend: {
            display: true,
            position: 'top'
          }
        },
        scales: {
          x: {
            title: {
              display: true,
              text: 'Date'
            }
          },
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Views'
            }
          }
        }
      }
    });
  }
  
  // Render user activity chart
  function renderUserActivityChart() {
    if (!elements.userActivityChart) return;
    
    // If Chart.js is not available, show error
    if (typeof Chart === 'undefined') {
      elements.userActivityChart.innerHTML = '<div class="w3-panel w3-pale-red"><p>Chart.js is required to display this chart.</p></div>';
      return;
    }
    
    // Prepare data
    const labels = Object.keys(statsCache.userActivity).sort();
    const sessions = labels.map(label => statsCache.userActivity[label]?.sessions || 0);
    const edits = labels.map(label => statsCache.userActivity[label]?.edits || 0);
    const logins = labels.map(label => statsCache.userActivity[label]?.logins || 0);
    
    // Destroy existing chart if it exists
    if (chartInstances.userActivity) {
      chartInstances.userActivity.destroy();
    }
    
    // Create chart
    const ctx = elements.userActivityChart.getContext('2d');
    chartInstances.userActivity = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Sessions',
            data: sessions,
            backgroundColor: 'rgba(52, 152, 219, 0.6)'
          },
          {
            label: 'Edits',
            data: edits,
            backgroundColor: 'rgba(46, 204, 113, 0.6)'
          },
          {
            label: 'Logins',
            data: logins,
            backgroundColor: 'rgba(155, 89, 182, 0.6)'
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: 'User Activity',
            font: {
              size: 16
            }
          },
          tooltip: {
            mode: 'index',
            intersect: false
          },
          legend: {
            display: true,
            position: 'top'
          }
        },
        scales: {
          x: {
            title: {
              display: true,
              text: 'Date'
            }
          },
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Count'
            }
          }
        }
      }
    });
  }
  
  // Render popular pages
  function renderPopularPages() {
    if (!elements.popularPagesContainer) return;
    
    // If no data, show message
    if (!statsCache.popularPages.length) {
      elements.popularPagesContainer.innerHTML = '<div class="w3-panel w3-pale-yellow"><p>No page view data available.</p></div>';
      return;
    }
    
    // Create HTML for popular pages
    let html = `
      <table class="w3-table w3-striped w3-bordered">
        <thead>
          <tr class="w3-light-grey">
            <th>Page</th>
            <th>Views</th>
            <th>Last Viewed</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
    `;
    
    // Add rows for each page
    statsCache.popularPages.forEach(page => {
      const lastViewedStr = page.lastViewed ? 
        page.lastViewed.toLocaleDateString('de-DE', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit'
        }) : 'N/A';
      
      html += `
        <tr>
          <td>${page.title}</td>
          <td>${page.views}</td>
          <td>${lastViewedStr}</td>
          <td>
            <a href="page.php?id=${page.pageId}" target="_blank" class="w3-button w3-small w3-blue">
              <i class="fas fa-eye"></i>
            </a>
            <button class="w3-button w3-small w3-green" onclick="PageEditor.openEditor('${page.pageId}')">
              <i class="fas fa-edit"></i>
            </button>
          </td>
        </tr>
      `;
    });
    
    html += `
        </tbody>
      </table>
    `;
    
    // Update container
    elements.popularPagesContainer.innerHTML = html;
  }
  
  // Refresh data
  function refreshData(force = false) {
    // If not forcing refresh and data was loaded less than 5 minutes ago, skip
    if (!force && statsCache.lastUpdated && (new Date() - statsCache.lastUpdated) < 5 * 60 * 1000) {
      console.log('Skipping data refresh (data is recent)');
      return;
    }
    
    console.log('Refreshing statistics data...');
    loadStatistics();
  }
  
  // Export data
  function exportData(format) {
    // Prepare data for export
    const dateRange = getSelectedDateRange();
    const startDateStr = formatDate(dateRange.startDate);
    const endDateStr = formatDate(dateRange.endDate);
    
    // Prepare data
    const exportData = {
      pageViews: statsCache.pageViews,
      userActivity: statsCache.userActivity,
      popularPages: statsCache.popularPages,
      dateRange: {
        start: startDateStr,
        end: endDateStr
      },
      exportDate: new Date().toISOString()
    };
    
    // Export based on format
    switch (format) {
      case 'csv':
        exportAsCSV(exportData);
        break;
        
      case 'excel':
        exportAsExcel(exportData);
        break;
        
      default:
        console.error('Unsupported export format:', format);
        showStatus('Unsupported export format', true);
    }
  }
  
  // Export data as CSV
  function exportAsCSV(data) {
    // Create CSV content
    let csvContent = 'data:text/csv;charset=utf-8,';
    
    // Page Views
    csvContent += 'Page Views\n';
    csvContent += 'Date,Views\n';
    
    Object.keys(data.pageViews).sort().forEach(date => {
      csvContent += `${date},${data.pageViews[date]}\n`;
    });
    
    csvContent += '\n';
    
    // User Activity
    csvContent += 'User Activity\n';
    csvContent += 'Date,Sessions,Edits,Logins\n';
    
    Object.keys(data.userActivity).sort().forEach(date => {
      const activity = data.userActivity[date];
      csvContent += `${date},${activity.sessions},${activity.edits},${activity.logins}\n`;
    });
    
    csvContent += '\n';
    
    // Popular Pages
    csvContent += 'Popular Pages\n';
    csvContent += 'Page ID,Title,Views,Last Viewed\n';
    
    data.popularPages.forEach(page => {
      const lastViewedStr = page.lastViewed ? 
        new Date(page.lastViewed).toISOString() : 'N/A';
      
      csvContent += `${page.pageId},${page.title},${page.views},${lastViewedStr}\n`;
    });
    
    // Create download link
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `statistics_${data.dateRange.start}_to_${data.dateRange.end}.csv`);
    document.body.appendChild(link);
    
    // Trigger download
    link.click();
    
    // Clean up
    document.body.removeChild(link);
    
    showStatus('CSV exported successfully');
  }
  
  // Export data as Excel (simplified - actual Excel export would require a library like SheetJS)
  function exportAsExcel(data) {
    // For simplicity, we'll just export as CSV with an .xlsx extension
    // In a production environment, you would use a library like SheetJS to create proper Excel files
    
    // Create CSV content (same as above)
    let csvContent = 'data:text/csv;charset=utf-8,';
    
    // Page Views
    csvContent += 'Page Views\n';
    csvContent += 'Date,Views\n';
    
    Object.keys(data.pageViews).sort().forEach(date => {
      csvContent += `${date},${data.pageViews[date]}\n`;
    });
    
    csvContent += '\n';
    
    // User Activity
    csvContent += 'User Activity\n';
    csvContent += 'Date,Sessions,Edits,Logins\n';
    
    Object.keys(data.userActivity).sort().forEach(date => {
      const activity = data.userActivity[date];
      csvContent += `${date},${activity.sessions},${activity.edits},${activity.logins}\n`;
    });
    
    csvContent += '\n';
    
    // Popular Pages
    csvContent += 'Popular Pages\n';
    csvContent += 'Page ID,Title,Views,Last Viewed\n';
    
    data.popularPages.forEach(page => {
      const lastViewedStr = page.lastViewed ? 
        new Date(page.lastViewed).toISOString() : 'N/A';
      
      csvContent += `${page.pageId},${page.title},${page.views},${lastViewedStr}\n`;
    });
    
    // Create download link
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `statistics_${data.dateRange.start}_to_${data.dateRange.end}.xlsx`);
    document.body.appendChild(link);
    
    // Trigger download
    link.click();
    
    // Clean up
    document.body.removeChild(link);
    
    showStatus('Excel report exported successfully. Note: For advanced Excel features, please install a proper Excel export library.');
  }
  
  // Show status message
  function showStatus(message, isError = false, timeout = 3000) {
    const statusMsg = document.getElementById('statusMsg');
    if (!statusMsg) return;
    
    statusMsg.textContent = message;
    statusMsg.className = isError ? 'status-msg error show' : 'status-msg success show';
    
    // Hide after timeout unless it's 0 (persistent)
    if (timeout > 0) {
      setTimeout(() => {
        statusMsg.classList.remove('show');
      }, timeout);
    }
  }
  
  // Track page view (can be called from other parts of the application)
  function trackPageView(pageId, pageTitle) {
    // Skip if not using Firebase
    if (!db) return;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Increment daily page views
    const dailyDocRef = db.collection('analytics')
      .doc('pageViews')
      .collection('daily')
      .doc(formatDate(today));
    
    // Use transaction to safely increment counter
    db.runTransaction(transaction => {
      return transaction.get(dailyDocRef).then(docSnapshot => {
        if (!docSnapshot.exists) {
          transaction.set(dailyDocRef, {
            date: today,
            count: 1
          });
        } else {
          const newCount = (docSnapshot.data().count || 0) + 1;
          transaction.update(dailyDocRef, { count: newCount });
        }
      });
    }).catch(error => {
      console.error('Error tracking page view:', error);
    });
    
    // Update popular pages
    if (pageId) {
      const pageDocRef = db.collection('analytics')
        .doc('popularPages')
        .collection('aggregate')
        .doc(pageId);
      
      // Use transaction to safely update page stats
      db.runTransaction(transaction => {
        return transaction.get(pageDocRef).then(docSnapshot => {
          if (!docSnapshot.exists) {
            transaction.set(pageDocRef, {
              title: pageTitle || pageId,
              views: 1,
              lastViewed: new Date()
            });
          } else {
            const newViews = (docSnapshot.data().views || 0) + 1;
            transaction.update(pageDocRef, { 
              views: newViews,
              lastViewed: new Date(),
              title: pageTitle || docSnapshot.data().title || pageId
            });
          }
        });
      }).catch(error => {
        console.error('Error updating popular pages:', error);
      });
    }
  }
  
  // Track user activity
  function trackUserActivity(activityType) {
    // Skip if not using Firebase
    if (!db) return;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Activity types: 'session', 'edit', 'login'
    const validTypes = ['session', 'edit', 'login'];
    if (!validTypes.includes(activityType)) {
      console.error('Invalid activity type:', activityType);
      return;
    }
    
    // Get field name based on activity type
    const fieldName = activityType === 'session' ? 'sessions' : 
                       activityType === 'edit' ? 'edits' : 'logins';
    
    // Increment daily activity counter
    const dailyDocRef = db.collection('analytics')
      .doc('userActivity')
      .collection('daily')
      .doc(formatDate(today));
    
    // Use transaction to safely increment counter
    db.runTransaction(transaction => {
      return transaction.get(dailyDocRef).then(docSnapshot => {
        if (!docSnapshot.exists) {
          const data = {
            date: today
          };
          data[fieldName] = 1;
          transaction.set(dailyDocRef, data);
        } else {
          const fieldValue = (docSnapshot.data()[fieldName] || 0) + 1;
          const update = {};
          update[fieldName] = fieldValue;
          transaction.update(dailyDocRef, update);
        }
      });
    }).catch(error => {
      console.error('Error tracking user activity:', error);
    });
  }
  
  // Log edit activity (change log)
  function logEdit(userId, pageId, action, details) {
    // Skip if not using Firebase
    if (!db) return;
    
    // Create log entry
    const logEntry = {
      timestamp: new Date(),
      userId: userId || 'unknown',
      pageId: pageId || 'unknown',
      action: action || 'edit',
      details: details || {}
    };
    
    // Add to change log collection
    db.collection('changeLog')
      .add(logEntry)
      .then(() => {
        // Increment edit counter in user activity
        trackUserActivity('edit');
      })
      .catch(error => {
        console.error('Error logging edit:', error);
      });
  }

  // Public API
  return {
    init,
    refreshData,
    exportData,
    trackPageView,
    trackUserActivity,
    logEdit
  };
})();

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', function() {
  Dashboard.init();
  
  // Track session if this is a new page load (not a refresh)
  if (performance && performance.navigation && performance.navigation.type !== 1) {
    Dashboard.trackUserActivity('session');
  }
});

// Expose to window for use in other scripts
window.Dashboard = Dashboard;