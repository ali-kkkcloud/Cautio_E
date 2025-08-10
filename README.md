# Employee Management System

A complete web-based employee management system with login/logout functionality, break tracking, and Google Sheets integration.

## Features

- 🔐 **Admin & Employee Login System**
- 👥 **Employee Management** (Add/Remove employees)
- ⏰ **Break Tracking System**
- 📊 **Real-time Dashboard**
- 📱 **Responsive Design**
- 🔗 **Google Sheets Integration**

## Setup Instructions

### 1. Google Sheets Setup

1. Open your Google Sheet: `https://docs.google.com/spreadsheets/d/15pNN3vIuLFug6nlL-GN0uwvkasLokGwPO5kTxmPIZZw/edit`

2. Make sure your sheet has these columns in the first row:
   ```
   A: Employee_ID
   B: Name
   C: Department
   D: Position
   E: Status
   F: Login_Time
   G: Break_Time
   H: Last_Activity
   ```

3. Make your sheet publicly readable:
   - Click **Share** button
   - Change to **Anyone with the link**
   - Set permission to **Viewer**

### 2. Google Sheets API Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google Sheets API:
   - Go to **APIs & Services** → **Library**
   - Search for "Google Sheets API"
   - Click **Enable**

4. Create API Key:
   - Go to **APIs & Services** → **Credentials**
   - Click **Create Credentials** → **API Key**
   - Copy the API key

5. Restrict the API Key (recommended):
   - Click on your API key
   - Under **API restrictions**, select **Restrict key**
   - Choose **Google Sheets API**
   - Under **Website restrictions**, add your domain

### 3. Update Configuration

1. Open `index.html`
2. Find the `CONFIG` object (around line 200)
3. Replace `YOUR_GOOGLE_SHEETS_API_KEY` with your actual API key:

```javascript
const CONFIG = {
    SHEET_ID: '15pNN3vIuLFug6nlL-GN0uwvkasLokGwPO5kTxmPIZZw',
    API_KEY: 'YOUR_ACTUAL_API_KEY_HERE', // Replace this
    ADMIN_CREDENTIALS: {
        username: 'admin',
        password: 'admin123'
    }
};
```

### 4. GitHub Deployment

1. Create a new repository on GitHub
2. Upload these files:
   - `index.html`
   - `README.md`

3. Enable GitHub Pages:
   - Go to repository **Settings**
   - Scroll down to **Pages**
   - Select **Deploy from a branch**
   - Choose **main** branch
   - Click **Save**

4. Your site will be available at:
   `https://yourusername.github.io/repository-name`

## Default Login Credentials

### Admin Login
- **Username:** `admin`
- **Password:** `admin123`

### Employee Login
- Use Employee ID from the Google Sheet
- Default test employees: `EMP001`, `EMP002`

## File Structure

```
employee-management-system/
├── index.html          # Main application file
├── README.md          # Setup instructions
└── .gitignore         # Git ignore file
```

## Usage

### Admin Features
- View employee statistics
- Add new employees
- Remove employees
- Monitor employee status in real-time

### Employee Features
- Login with Employee ID
- Take breaks and track time
- View daily activity summary
- Automatic logout tracking

## Customization

### Change Admin Credentials
Edit the `CONFIG.ADMIN_CREDENTIALS` object in `index.html`:

```javascript
ADMIN_CREDENTIALS: {
    username: 'your_username',
    password: 'your_password'
}
```

### Modify Employee Status Options
You can add more status types by updating the status handling functions in the JavaScript section.

### Styling
All CSS is included in the `<style>` section of `index.html`. You can modify colors, layout, and responsive breakpoints there.

## Google Sheets API Integration

The system uses the Google Sheets API v4 to:
- Read employee data
- Update employee status
- Track login/logout times
- Monitor break duration

### API Endpoints Used
- `GET /v4/spreadsheets/{spreadsheetId}/values/{range}`
- `PUT /v4/spreadsheets/{spreadsheetId}/values/{range}`

## Security Notes

1. **API Key Security**: Never commit your actual API key to public repositories
2. **Admin Credentials**: Change default admin credentials before deployment
3. **Sheet Permissions**: Only give necessary permissions to your Google Sheet
4. **HTTPS**: Always use HTTPS for production deployment

## Troubleshooting

### Common Issues

1. **"API key not valid"**
   - Check if you've replaced the placeholder API key
   - Ensure the API key has Google Sheets API enabled
   - Verify domain restrictions if set

2. **"Cannot read sheet data"**
   - Check if the sheet is publicly readable
   - Verify the sheet ID in the configuration
   - Ensure the sheet has the correct column headers

3. **"Employee not found"**
   - Check if the employee ID exists in the Google Sheet
   - Verify the Employee_ID column format

## Support

For issues and questions:
1. Check the browser console for error messages
2. Verify your Google Sheets setup
3. Ensure API key is correctly configured

## License

This project is open source and available under the MIT License.
