// Google Sheets Integration Module
// Save this as 'sheets.js' and include it in your HTML

class GoogleSheetsDB {
    constructor(sheetId, apiKey) {
        this.sheetId = sheetId;
        this.apiKey = apiKey;
        this.baseUrl = 'https://sheets.googleapis.com/v4/spreadsheets';
        this.range = 'Sheet1'; // Change if your sheet has a different name
    }

    // Get all employee data from the sheet
    async getEmployees() {
        try {
            const url = `${this.baseUrl}/${this.sheetId}/values/${this.range}?key=${this.apiKey}`;
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (!data.values || data.values.length === 0) {
                return [];
            }

            // Convert sheet data to employee objects
            const headers = data.values[0];
            const employees = [];

            for (let i = 1; i < data.values.length; i++) {
                const row = data.values[i];
                const employee = {};
                
                headers.forEach((header, index) => {
                    const key = this.camelCase(header);
                    employee[key] = row[index] || '';
                });

                // Ensure required fields
                if (employee.employeeId) {
                    employees.push({
                        id: employee.employeeId,
                        name: employee.name || '',
                        department: employee.department || '',
                        position: employee.position || '',
                        status: employee.status || 'logged-out',
                        loginTime: employee.loginTime || null,
                        breakTime: parseInt(employee.breakTime) || 0,
                        lastActivity: employee.lastActivity || new Date().toISOString()
                    });
                }
            }

            return employees;
        } catch (error) {
            console.error('Error fetching employees:', error);
            throw error;
        }
    }

    // Add a new employee to the sheet
    async addEmployee(employee) {
        try {
            // First, get the current data to find the next empty row
            const currentData = await this.getSheetData();
            const nextRow = currentData.values ? currentData.values.length + 1 : 2;

            const values = [
                employee.id,
                employee.name,
                employee.department,
                employee.position,
                'logged-out',
                '',
                '0',
                new Date().toISOString()
            ];

            const url = `${this.baseUrl}/${this.sheetId}/values/${this.range}!A${nextRow}:H${nextRow}?valueInputOption=RAW&key=${this.apiKey}`;
            
            const response = await fetch(url, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    values: [values]
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error adding employee:', error);
            throw error;
        }
    }

    // Update employee status in the sheet
    async updateEmployeeStatus(employeeId, status, loginTime = null, breakTime = 0) {
        try {
            const employees = await this.getEmployees();
            const employeeIndex = employees.findIndex(emp => emp.id === employeeId);
            
            if (employeeIndex === -1) {
                throw new Error('Employee not found');
            }

            // Row number in sheet (adding 2 because of 0-based index and header row)
            const rowNumber = employeeIndex + 2;
            
            // Update specific columns
            const updates = [
                {
                    range: `${this.range}!E${rowNumber}`, // Status column
                    values: [[status]]
                },
                {
                    range: `${this.range}!F${rowNumber}`, // Login time column
                    values: [[loginTime || '']]
                },
                {
                    range: `${this.range}!G${rowNumber}`, // Break time column
                    values: [[breakTime.toString()]]
                },
                {
                    range: `${this.range}!H${rowNumber}`, // Last activity column
                    values: [[new Date().toISOString()]]
                }
            ];

            const promises = updates.map(update => this.updateRange(update.range, update.values));
            await Promise.all(promises);

            return true;
        } catch (error) {
            console.error('Error updating employee status:', error);
            throw error;
        }
    }

    // Remove employee from the sheet
    async removeEmployee(employeeId) {
        try {
            // Note: Google Sheets API doesn't have a direct delete row function
            // This is a workaround - we'll clear the row data
            const employees = await this.getEmployees();
            const employeeIndex = employees.findIndex(emp => emp.id === employeeId);
            
            if (employeeIndex === -1) {
                throw new Error('Employee not found');
            }

            const rowNumber = employeeIndex + 2;
            const range = `${this.range}!A${rowNumber}:H${rowNumber}`;
            
            // Clear the entire row
            const url = `${this.baseUrl}/${this.sheetId}/values/${range}:clear?key=${this.apiKey}`;
            
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error removing employee:', error);
            throw error;
        }
    }

    // Helper method to update a specific range
    async updateRange(range, values) {
        const url = `${this.baseUrl}/${this.sheetId}/values/${range}?valueInputOption=RAW&key=${this.apiKey}`;
        
        const response = await fetch(url, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ values })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
    }

    // Get raw sheet data
    async getSheetData() {
        const url = `${this.baseUrl}/${this.sheetId}/values/${this.range}?key=${this.apiKey}`;
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        return await response.json();
    }

    // Helper method to convert header names to camelCase
    camelCase(str) {
        return str
            .toLowerCase()
            .replace(/[^a-zA-Z0-9]+(.)/g, (m, chr) => chr.toUpperCase());
    }

    // Initialize the sheet with headers if empty
    async initializeSheet() {
        try {
            const data = await this.getSheetData();
            
            // If sheet is empty or doesn't have headers, add them
            if (!data.values || data.values.length === 0) {
                const headers = [
                    'Employee_ID',
                    'Name',
                    'Department',
                    'Position',
                    'Status',
                    'Login_Time',
                    'Break_Time',
                    'Last_Activity'
                ];

                await this.updateRange(`${this.range}!A1:H1`, [headers]);
                console.log('Sheet initialized with headers');
            }
        } catch (error) {
            console.error('Error initializing sheet:', error);
            throw error;
        }
    }

    // Bulk update multiple employees
    async bulkUpdateEmployees(employees) {
        try {
            const updates = employees.map((employee, index) => {
                const rowNumber = index + 2; // Assuming sequential order
                return {
                    range: `${this.range}!A${rowNumber}:H${rowNumber}`,
                    values: [[
                        employee.id,
                        employee.name,
                        employee.department,
                        employee.position,
                        employee.status,
                        employee.loginTime || '',
                        employee.breakTime.toString(),
                        employee.lastActivity
                    ]]
                };
            });

            // Execute all updates
            const promises = updates.map(update => this.updateRange(update.range, update.values));
            await Promise.all(promises);

            return true;
        } catch (error) {
            console.error('Error bulk updating employees:', error);
            throw error;
        }
    }

    // Get employee by ID
    async getEmployeeById(employeeId) {
        const employees = await this.getEmployees();
        return employees.find(emp => emp.id === employeeId);
    }

    // Check if sheet is accessible
    async testConnection() {
        try {
            await this.getSheetData();
            return { success: true, message: 'Connection successful' };
        } catch (error) {
            return { 
                success: false, 
                message: `Connection failed: ${error.message}` 
            };
        }
    }
}

// Usage example:
/*
const sheetsDB = new GoogleSheetsDB(CONFIG.SHEET_ID, CONFIG.API_KEY);

// Initialize the sheet
await sheetsDB.initializeSheet();

// Get all employees
const employees = await sheetsDB.getEmployees();

// Add a new employee
await sheetsDB.addEmployee({
    id: 'EMP003',
    name: 'John Doe',
    department: 'IT',
    position: 'Developer'
});

// Update employee status
await sheetsDB.updateEmployeeStatus('EMP003', 'working', '09:00', 0);

// Remove employee
await sheetsDB.removeEmployee('EMP003');
*/

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GoogleSheetsDB;
}
