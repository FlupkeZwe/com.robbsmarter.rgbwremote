'use strict';

class ColorConverter {

    static xy2rgb(x, y, brightness) {
        //Set to maximum brightness if no custom value was given (Not the slick ECMAScript 6 way for compatibility reasons)
        if (brightness === undefined) {
            brightness = 254;
        }

        const z = 1.0 - x - y;
        const Y = (brightness / 254).toFixed(2);
        const X = (Y / y) * x;
        const Z = (Y / y) * z;

        //Convert to RGB using Wide RGB D65 conversion
        let red = X * 1.656492 - Y * 0.354851 - Z * 0.255038;
        let green = -X * 0.707196 + Y * 1.655397 + Z * 0.036152;
        let blue = X * 0.051713 - Y * 0.121364 + Z * 1.011530;

        //If red, green or blue is larger than 1.0 set it back to the maximum of 1.0
        if (red > blue && red > green && red > 1.0) {

            green = green / red;
            blue = blue / red;
            red = 1.0;
        } else if (green > blue && green > red && green > 1.0) {

            red = red / green;
            blue = blue / green;
            green = 1.0;
        } else if (blue > red && blue > green && blue > 1.0) {

            red = red / blue;
            green = green / blue;
            blue = 1.0;
        }

        //Reverse gamma correction
        red = red <= 0.0031308 ? 12.92 * red : (1.0 + 0.055) * Math.pow(red, (1.0 / 2.4)) - 0.055;
        green = green <= 0.0031308 ? 12.92 * green : (1.0 + 0.055) * Math.pow(green, (1.0 / 2.4)) - 0.055;
        blue = blue <= 0.0031308 ? 12.92 * blue : (1.0 + 0.055) * Math.pow(blue, (1.0 / 2.4)) - 0.055;


        //Convert normalized decimal to decimal
        red = Math.round(red * 255);
        green = Math.round(green * 255);
        blue = Math.round(blue * 255);

        if (isNaN(red))
            red = 0;

        if (isNaN(green))
            green = 0;

        if (isNaN(blue))
            blue = 0;

        return {
            r: red,
            g: green,
            b: blue,
        };
    }
    
    static xy2hsv(x,y, brightness) {
        const rgbColor = ColorConverter.xy2rgb(x,y, brightness);
        
        const maxM = Math.max(rgbColor.r, rgbColor.g, rgbColor.b);
        const minM = Math.min(rgbColor.r, rgbColor.g, rgbColor.b);
        const value = Math.max(0, Math.min(1, maxM/255)); //value is between 0 and 1
        let saturation = 0;
        if (maxM > 0) {
            saturation = 1 - minM/maxM;
        }
        saturation = Math.max(0, Math.min(1,saturation)); // Saturation is between 0 and 1
        
        const hueDiagonal = Math.sqrt(Math.pow(rgbColor.r, 2) + Math.pow(rgbColor.g, 2) + Math.pow(rgbColor.b, 2) - (rgbColor.r * rgbColor.g) - (rgbColor.r * rgbColor.b) - (rgbColor.g * rgbColor.b));
        let hueRadian = Math.acos((rgbColor.r - 0.5 * rgbColor.g - 0.5 * rgbColor.b)/hueDiagonal);
        if (rgbColor.g < rgbColor.b) {
            hueRadian = 2 * Math.PI - hueRadian;
        }
        const hue = Math.round(hueRadian * (180/Math.PI)); //convert to whole degrees
        
        return {
            h: hue,
            s: saturation,
            v: value
        };        
    }

}
module.exports = ColorConverter;