# Gap Pad Validator - Enhanced

A comprehensive web application for detecting and validating thermal gap pad placement on printed circuit boards (PCBs) using computer vision and template overlays.

## 🚀 Key Features

### 1. **Product Template Overlay System**
- **3U, 6U, and MXC/XMC Board Support**: Pre-defined templates with actual dimensions
  - **3U**: 160mm × 100mm × 25.4mm
  - **6U**: 160mm × 233mm × 25.4mm  
  - **MXC/XMC**: 143.75mm × 74mm × 25.4mm
- **Multiple Variants**: Different pad layouts for various board configurations
- **Real-time Alignment**: Visual overlay helps users position PCBs correctly
- **Camera Calibration**: Adjustable template size to match real-world dimensions

### 2. **Advanced Computer Vision**
- **HSV Color Detection**: Sophisticated color space analysis for gap pad identification
- **Board-Aware Filtering**: Intelligently excludes PCB colors to focus on thermal pads
- **Morphological Processing**: Advanced image processing for clean detection results
- **Fallback Detection**: Multiple detection methods ensure reliability

### 3. **Manual Teaching Mode**
- **Click-to-Teach**: Manually define pad positions by clicking on the template
- **Smart Positioning**: Automatically snaps to nearest expected pad location
- **Custom Pad Creation**: Add pads that don't match standard templates

### 4. **Comprehensive Validation**
- **Pad Count Validation**: Ensures all required pads are present
- **Placement Accuracy**: Checks if pads are positioned correctly
- **Real-time Monitoring**: Continuous validation with live feedback
- **Detailed Reporting**: Success/warning/error status with accuracy metrics

## 🛠️ Installation & Setup

### Prerequisites
- Node.js 18+ 
- Modern web browser with camera access
- Python 3.8+ (for external library management)

### Quick Start
```bash
# Clone the repository
git clone <repository-url>
cd gap-pad-web

# Install dependencies
npm install

# Start development server
npm run dev
```

The application will open in your browser at `http://localhost:3000`

## 📱 Usage Guide

### 1. **Select Your Product**
- Choose board type (3U, 6U, or Custom)
- Select specific variant (Basic, High Power, Server, etc.)
- View expected pad count and dimensions

### 2. **Position Your PCB**
- Enable template overlay to see expected board position
- Align your PCB with the green dashed outline
- Use camera calibration if template size doesn't match

### 3. **Capture Reference Image**
- Enter serial number for your board
- Select front/back side
- Click "Capture Reference" to save the template

### 4. **Manual Teaching (Optional)**
- Enable "Manual Teaching" mode
- Click on template to define actual pad positions
- Useful when automatic detection fails

### 5. **Validate Production**
- Use "Start Validation" for continuous monitoring
- Real-time feedback on pad count and placement
- Pass/fail status with accuracy metrics

## 🔧 External Product Library Management

### Python Script Integration
Use the included Python script to manage product definitions externally:

```bash
python product_library_manager.py
```

**Features:**
- Add custom board types and variants
- Define pad layouts with coordinates
- Export to JSON or JavaScript format
- Future: CAD integration and image analysis

### Adding Custom Products
```python
# Example: Adding a custom 3U board
manager = ProductLibraryManager()

pad_layout = [
    {'x': 0.2, 'y': 0.2, 'width': 0.15, 'height': 0.15, 'required': True, 'name': 'CPU'},
    {'x': 0.8, 'y': 0.2, 'width': 0.15, 'height': 0.15, 'required': True, 'name': 'GPU'},
    # ... more pads
]

manager.add_custom_product("3U", "Custom-Variant", 100, 160, pad_layout)
manager.export_for_web_app("src/productLibrary.js")
```

### JSON Format
```json
{
  "3U": {
    "width": 100,
    "height": 160,
    "variants": {
      "Custom-Variant": {
        "name": "Custom 3U Board",
        "description": "User-defined layout",
        "expectedPads": 2,
        "padLayout": [
          {
            "x": 0.2,
            "y": 0.2,
            "width": 0.15,
            "height": 0.15,
            "required": true,
            "name": "CPU",
            "color": "#ff6600"
          }
        ]
      }
    }
  }
}
```

## 🎯 Use Cases

### Manufacturing Quality Control
- **Assembly Validation**: Ensure thermal pads are correctly placed
- **Missing Pad Detection**: Identify boards with incomplete thermal management
- **Position Accuracy**: Verify pad placement within tolerance limits

### Training & Documentation
- **Operator Training**: Visual guides for proper board positioning
- **Process Documentation**: Reference images for assembly procedures
- **Quality Standards**: Consistent validation across production lines

### Research & Development
- **Prototype Testing**: Validate new board designs
- **Pad Layout Optimization**: Test different thermal management configurations
- **Performance Analysis**: Track pad placement accuracy over time

## 🔍 Technical Details

### Computer Vision Algorithms
- **HSV Color Space**: Better color discrimination than RGB
- **Morphological Operations**: Erosion, dilation, and noise removal
- **Contour Detection**: Connected component analysis for pad identification
- **Board-Aware Filtering**: Excludes PCB colors to focus on thermal pads

### Performance Optimizations
- **Pixel Skipping**: Process every other pixel for speed
- **Efficient Algorithms**: Optimized for real-time processing
- **Fallback Mechanisms**: Multiple detection methods ensure reliability

### Browser Compatibility
- **Modern Web APIs**: Uses latest browser capabilities
- **Camera Access**: Environment-facing camera support
- **Local Storage**: Saves reference images locally
- **PWA Support**: Progressive web app features

## 🚧 Future Enhancements

### Planned Features
- **CAD Integration**: Import pad layouts from design files
- **Machine Learning**: AI-powered pad detection and classification
- **Cloud Storage**: Centralized reference image management
- **Multi-Camera Support**: Multiple camera angles for complex boards
- **Statistical Analysis**: Production quality metrics and trends

### Integration Possibilities
- **MES Systems**: Manufacturing execution system integration
- **Quality Management**: Integration with QMS software
- **IoT Devices**: Real-time data from production equipment
- **Mobile Apps**: Native mobile applications

## 🐛 Troubleshooting

### Common Issues

**Camera Not Working**
- Check browser permissions
- Ensure camera is not in use by other applications
- Try refreshing the page

**Template Overlay Misaligned**
- Use camera calibration feature
- Place known-size object in view
- Adjust calibration values

**Detection Not Working**
- Check lighting conditions
- Ensure gap pads are visible (magenta/cyan/silver)
- Try manual teaching mode

**Performance Issues**
- Close other browser tabs
- Reduce camera resolution if needed
- Check browser console for errors

### Debug Mode
Enable debug logging in browser console:
```javascript
localStorage.setItem('debugMode', 'true');
```

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📞 Support

For questions or issues:
- Create an issue in the repository
- Check the troubleshooting section
- Review the code comments for implementation details

---

**Built with React, Vite, and Computer Vision for Manufacturing Excellence**
