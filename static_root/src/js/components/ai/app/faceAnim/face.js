/********************************************************************
// For better management of the code, it is recommended to build constructor 
//or namespace 
********************************************************************/

import * as THREE from 'three';

import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { KTX2Loader } from 'three/addons/loaders/KTX2Loader.js';

import Stats from 'three/addons/libs/stats.module.js';

import { LoopSubdivision } from 'https://unpkg.com/three-subdivide/build/index.module.js';

import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { BleachBypassShader } from 'three/addons/shaders/BleachBypassShader.js';
import { ColorCorrectionShader } from 'three/addons/shaders/ColorCorrectionShader.js';
import { FXAAShader } from 'three/addons/shaders/FXAAShader.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

import { DecalGeometry } from 'three/addons/geometries/DecalGeometry.js';

import { GLTFExporter } from 'three/addons/exporters/GLTFExporter.js';

import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';

import { GUI } from 'three/addons/libs/lil-gui.module.min.js';

import vision from 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0';

const { FaceLandmarker, FilesetResolver } = vision;

// Mediapipe

const blendshapesMap = {
  // '_neutral': '',
  'browDownLeft': 'browDown_L',
  'browDownRight': 'browDown_R',
  'browInnerUp': 'browInnerUp',
  'browOuterUpLeft': 'browOuterUp_L',
  'browOuterUpRight': 'browOuterUp_R',
  'cheekPuff': 'cheekPuff',
  'cheekSquintLeft': 'cheekSquint_L',
  'cheekSquintRight': 'cheekSquint_R',
  'eyeBlinkLeft': 'eyeBlink_L',
  'eyeBlinkRight': 'eyeBlink_R',
  'eyeLookDownLeft': 'eyeLookDown_L',
  'eyeLookDownRight': 'eyeLookDown_R',
  'eyeLookInLeft': 'eyeLookIn_L',
  'eyeLookInRight': 'eyeLookIn_R',
  'eyeLookOutLeft': 'eyeLookOut_L',
  'eyeLookOutRight': 'eyeLookOut_R',
  'eyeLookUpLeft': 'eyeLookUp_L',
  'eyeLookUpRight': 'eyeLookUp_R',
  'eyeSquintLeft': 'eyeSquint_L',
  'eyeSquintRight': 'eyeSquint_R',
  'eyeWideLeft': 'eyeWide_L',
  'eyeWideRight': 'eyeWide_R',
  'jawForward': 'jawForward',
  'jawLeft': 'jawLeft',
  'jawOpen': 'jawOpen',
  'jawRight': 'jawRight',
  'mouthClose': 'mouthClose',
  'mouthDimpleLeft': 'mouthDimple_L',
  'mouthDimpleRight': 'mouthDimple_R',
  'mouthFrownLeft': 'mouthFrown_L',
  'mouthFrownRight': 'mouthFrown_R',
  'mouthFunnel': 'mouthFunnel',
  'mouthLeft': 'mouthLeft',
  'mouthLowerDownLeft': 'mouthLowerDown_L',
  'mouthLowerDownRight': 'mouthLowerDown_R',
  'mouthPressLeft': 'mouthPress_L',
  'mouthPressRight': 'mouthPress_R',
  'mouthPucker': 'mouthPucker',
  'mouthRight': 'mouthRight',
  'mouthRollLower': 'mouthRollLower',
  'mouthRollUpper': 'mouthRollUpper',
  'mouthShrugLower': 'mouthShrugLower',
  'mouthShrugUpper': 'mouthShrugUpper',
  'mouthSmileLeft': 'mouthSmile_L',
  'mouthSmileRight': 'mouthSmile_R',
  'mouthStretchLeft': 'mouthStretch_L',
  'mouthStretchRight': 'mouthStretch_R',
  'mouthUpperUpLeft': 'mouthUpperUp_L',
  'mouthUpperUpRight': 'mouthUpperUp_R',
  'noseSneerLeft': 'noseSneer_L',
  'noseSneerRight': 'noseSneer_R',
  // '': 'tongueOut'
};



const facemesh_lips = [
  61, 146, 146, 91, 91, 181, 181, 84, 84, 17, 17, 314, 314, 405, 405, 321,
  321, 375, 375, 291, 61, 185, 185, 40, 40, 39, 39, 37, 37, 0, 0, 267, 267,
  269, 269, 270, 270, 409, 409, 291, 78, 95, 95, 88, 88, 178, 178, 87, 87,
  14, 14, 317, 317, 402, 402, 318, 318, 324, 324, 308, 78, 191, 191, 80, 80,
  81, 81, 82, 82, 13, 13, 312, 312, 311, 311, 310, 310, 415, 415, 308
];


const facemesh_left_eye = [
  263, 249, 249, 390, 390, 373, 373, 374, 374, 380, 380, 381, 381, 382, 382, 362,
  263, 466, 466, 388, 388, 387, 387, 386, 386, 385, 385, 384, 384, 398, 398, 362
];



const facemesh_left_iris = [
  474, 475, 475, 476, 476, 477, 477, 474
];

const facemesh_left_eyebrow = [
  276, 283, 283, 282, 282, 295, 295, 285, 300, 293, 293, 334, 334, 296, 296, 336
];

const facemesh_right_eye = [
  33, 7, 7, 163, 163, 144, 144, 145, 145, 153, 153, 154, 154, 155, 155, 133,
  33, 246, 246, 161, 161, 160, 160, 159, 159, 158, 158, 157, 157, 173, 173, 133
];


const facemesh_right_eyebrow = [
  46, 53, 53, 52, 52, 65, 65, 55, 70, 63, 63, 105, 105, 66, 66, 107
];


const facemesh_right_iris = [
  469, 470, 470, 471, 471, 472, 472, 469
];



const facemesh_nose = [
  168, 6, 6, 197, 197, 195, 195, 5, 5, 4, 4, 1, 1, 19, 19, 94, 94, 2, 98, 97,
  97, 2, 2, 326, 326, 327, 327, 294, 294, 278, 278, 344, 344, 440, 440, 275,
  275, 4, 4, 45, 45, 220, 220, 115, 115, 48, 48, 64, 64, 98
];


const face_vertices =
[
    173, 155, 133, 246, 33, 7, 382, 398, 362, 
    263, 466, 249, 308, 415, 324, 78, 95, 191, 356, 
    389, 264, 127, 34, 162, 368, 264, 389, 139, 162, 
    34, 267, 0, 302, 37, 72, 0, 11, 302, 0, 
    11, 0, 72, 349, 451, 350, 120, 121, 231, 452, 
    350, 451, 232, 231, 121, 267, 302, 269, 37, 39, 
    72, 303, 269, 302, 73, 72, 39, 357, 343, 350, 
    128, 121, 114, 277, 350, 343, 47, 114, 121, 350, 
    452, 357, 121, 128, 232, 453, 357, 452, 233, 232, 
    128, 299, 333, 297, 69, 67, 104, 332, 297, 333, 
    103, 104, 67, 175, 152, 396, 175, 171, 152, 377, 
    396, 152, 148, 152, 171, 381, 384, 382, 154, 155, 
    157, 398, 382, 384, 173, 157, 155, 280, 347, 330, 
    50, 101, 118, 348, 330, 347, 119, 118, 101, 269, 
    303, 270, 39, 40, 73, 304, 270, 303, 74, 73, 
    40, 9, 336, 151, 9, 151, 107, 337, 151, 336, 
    108, 107, 151, 344, 278, 360, 115, 131, 48, 279, 
    360, 278, 49, 48, 131, 262, 431, 418, 32, 194, 
    211, 424, 418, 431, 204, 211, 194, 304, 408, 270, 
    74, 40, 184, 409, 270, 408, 185, 184, 40, 272, 
    310, 407, 42, 183, 80, 415, 407, 310, 191, 80, 
    183, 322, 270, 410, 92, 186, 40, 409, 410, 270, 
    185, 40, 186, 347, 449, 348, 118, 119, 229, 450, 
    348, 449, 230, 229, 119, 434, 432, 430, 214, 210, 
    212, 422, 430, 432, 202, 212, 210, 313, 314, 18, 
    83, 18, 84, 17, 18, 314, 17, 84, 18, 307, 
    375, 306, 77, 76, 146, 291, 306, 375, 61, 146, 
    76, 259, 387, 260, 29, 30, 160, 388, 260, 387, 
    161, 160, 30, 286, 414, 384, 56, 157, 190, 398, 
    384, 414, 173, 190, 157, 418, 424, 406, 194, 182, 
    204, 335, 406, 424, 106, 204, 182, 367, 416, 364, 
    138, 135, 192, 434, 364, 416, 214, 192, 135, 391, 
    423, 327, 165, 98, 203, 358, 327, 423, 129, 203, 
    98, 298, 301, 284, 68, 54, 71, 251, 284, 301, 
    21, 71, 54, 4, 275, 5, 4, 5, 45, 281, 
    5, 275, 51, 45, 5, 254, 373, 253, 24, 23, 
    144, 374, 253, 373, 145, 144, 23, 320, 321, 307, 
    90, 77, 91, 375, 307, 321, 146, 91, 77, 280, 
    425, 411, 50, 187, 205, 427, 411, 425, 207, 205, 
    187, 421, 313, 200, 201, 200, 83, 18, 200, 313, 
    18, 83, 200, 335, 321, 406, 106, 182, 91, 405, 
    406, 321, 181, 91, 182, 405, 321, 404, 181, 180, 
    91, 320, 404, 321, 90, 91, 180, 17, 314, 16, 
    17, 16, 84, 315, 16, 314, 85, 84, 16, 425, 
    266, 426, 205, 206, 36, 423, 426, 266, 203, 36, 
    206, 369, 396, 400, 140, 176, 171, 377, 400, 396, 
    148, 171, 176, 391, 269, 322, 165, 92, 39, 270, 
    322, 269, 40, 39, 92, 417, 465, 413, 193, 189, 
    245, 464, 413, 465, 244, 245, 189, 257, 258, 386, 
    27, 159, 28, 385, 386, 258, 158, 28, 159, 260, 
    388, 467, 30, 247, 161, 466, 467, 388, 246, 161, 
    247, 248, 456, 419, 3, 196, 236, 399, 419, 456, 
    174, 236, 196, 333, 298, 332, 104, 103, 68, 284, 
    332, 298, 54, 68, 103, 285, 8, 417, 55, 193, 
    8, 168, 417, 8, 168, 8, 193, 340, 261, 346, 
    111, 117, 31, 448, 346, 261, 228, 31, 117, 285, 
    417, 441, 55, 221, 193, 413, 441, 417, 189, 193, 
    221, 327, 460, 326, 98, 97, 240, 328, 326, 460, 
    99, 240, 97, 277, 355, 329, 47, 100, 126, 371, 
    329, 355, 142, 126, 100, 309, 392, 438, 79, 218, 
    166, 439, 438, 392, 219, 166, 218, 381, 382, 256, 
    154, 26, 155, 341, 256, 382, 112, 155, 26, 360, 
    279, 420, 131, 198, 49, 429, 420, 279, 209, 49, 
    198, 365, 364, 379, 136, 150, 135, 394, 379, 364, 
    169, 135, 150, 355, 277, 437, 126, 217, 47, 343, 
    437, 277, 114, 47, 217, 443, 444, 282, 223, 52, 
    224, 283, 282, 444, 53, 224, 52, 281, 275, 363, 
    51, 134, 45, 440, 363, 275, 220, 45, 134, 431, 
    262, 395, 211, 170, 32, 369, 395, 262, 140, 32, 
    170, 337, 299, 338, 108, 109, 69, 297, 338, 299, 
    67, 69, 109, 335, 273, 321, 106, 91, 43, 375, 
    321, 273, 146, 43, 91, 348, 450, 349, 119, 120, 
    230, 451, 349, 450, 231, 230, 120, 467, 359, 342, 
    247, 113, 130, 446, 342, 359, 226, 130, 113, 282, 
    283, 334, 52, 105, 53, 293, 334, 283, 63, 53, 
    105, 250, 458, 462, 20, 242, 238, 461, 462, 458, 
    241, 238, 242, 276, 353, 300, 46, 70, 124, 383, 
    300, 353, 156, 124, 70, 325, 292, 324, 96, 95, 
    62, 308, 324, 292, 78, 62, 95, 283, 276, 293, 
    53, 63, 46, 300, 293, 276, 70, 46, 63, 447, 
    264, 345, 227, 116, 34, 372, 345, 264, 143, 34, 
    116, 352, 345, 346, 123, 117, 116, 340, 346, 345, 
    111, 116, 117, 1, 19, 274, 1, 44, 19, 354, 
    274, 19, 125, 19, 44, 248, 281, 456, 3, 236, 
    51, 363, 456, 281, 134, 51, 236, 425, 426, 427, 
    205, 207, 206, 436, 427, 426, 216, 206, 207, 380, 
    381, 252, 153, 22, 154, 256, 252, 381, 26, 154, 
    22, 391, 393, 269, 165, 39, 167, 267, 269, 393, 
    37, 167, 39, 199, 428, 200, 199, 200, 208, 421, 
    200, 428, 201, 208, 200, 330, 329, 266, 101, 36, 
    100, 371, 266, 329, 142, 100, 36, 422, 432, 273, 
    202, 43, 212, 287, 273, 432, 57, 212, 43, 290, 
    250, 328, 60, 99, 20, 462, 328, 250, 242, 20, 
    99, 258, 286, 385, 28, 158, 56, 384, 385, 286, 
    157, 56, 158, 342, 446, 353, 113, 124, 226, 265, 
    353, 446, 35, 226, 124, 257, 386, 259, 27, 29, 
    159, 387, 259, 386, 160, 159, 29, 430, 422, 431, 
    210, 211, 202, 424, 431, 422, 204, 202, 211, 445, 
    342, 276, 225, 46, 113, 353, 276, 342, 124, 113, 
    46, 424, 422, 335, 204, 106, 202, 273, 335, 422, 
    43, 202, 106, 306, 292, 307, 76, 77, 62, 325, 
    307, 292, 96, 62, 77, 366, 447, 352, 137, 123, 
    227, 345, 352, 447, 116, 227, 123, 302, 268, 303, 
    72, 73, 38, 271, 303, 268, 41, 38, 73, 371, 
    358, 266, 142, 36, 129, 423, 266, 358, 203, 129, 
    36, 327, 294, 460, 98, 240, 64, 455, 460, 294, 
    235, 64, 240, 294, 331, 278, 64, 48, 102, 279, 
    278, 331, 49, 102, 48, 303, 271, 304, 73, 74, 
    41, 272, 304, 271, 42, 41, 74, 427, 436, 434, 
    207, 214, 216, 432, 434, 436, 212, 216, 214, 304, 
    272, 408, 74, 184, 42, 407, 408, 272, 183, 42, 
    184, 394, 430, 395, 169, 170, 210, 431, 395, 430, 
    211, 210, 170, 395, 369, 378, 170, 149, 140, 400, 
    378, 369, 176, 140, 149, 296, 334, 299, 66, 69, 
    105, 333, 299, 334, 104, 105, 69, 417, 168, 351, 
    193, 122, 168, 6, 351, 168, 6, 168, 122, 280, 
    411, 352, 50, 123, 187, 376, 352, 411, 147, 187, 
    123, 319, 320, 325, 89, 96, 90, 307, 325, 320, 
    77, 90, 96, 285, 295, 336, 55, 107, 65, 296, 
    336, 295, 66, 65, 107, 404, 320, 403, 180, 179, 
    90, 319, 403, 320, 89, 90, 179, 330, 348, 329, 
    101, 100, 119, 349, 329, 348, 120, 119, 100, 334, 
    293, 333, 105, 104, 63, 298, 333, 293, 68, 63, 
    104, 323, 454, 366, 93, 137, 234, 447, 366, 454, 
    227, 234, 137, 16, 315, 15, 16, 15, 85, 316, 
    15, 315, 86, 85, 15, 429, 279, 358, 209, 129, 
    49, 331, 358, 279, 102, 49, 129, 15, 316, 14, 
    15, 14, 86, 317, 14, 316, 87, 86, 14, 8, 
    285, 9, 8, 9, 55, 336, 9, 285, 107, 55, 
    9, 329, 349, 277, 100, 47, 120, 350, 277, 349, 
    121, 120, 47, 252, 253, 380, 22, 153, 23, 374, 
    380, 253, 145, 23, 153, 402, 403, 318, 178, 88, 
    179, 319, 318, 403, 89, 179, 88, 351, 6, 419, 
    122, 196, 6, 197, 419, 6, 197, 6, 196, 324, 
    318, 325, 95, 96, 88, 319, 325, 318, 89, 88, 
    96, 397, 367, 365, 172, 136, 138, 364, 365, 367, 
    135, 138, 136, 288, 435, 397, 58, 172, 215, 367, 
    397, 435, 138, 215, 172, 438, 439, 344, 218, 115, 
    219, 278, 344, 439, 48, 219, 115, 271, 311, 272, 
    41, 42, 81, 310, 272, 311, 80, 81, 42, 5, 
    281, 195, 5, 195, 51, 248, 195, 281, 3, 51, 
    195, 273, 287, 375, 43, 146, 57, 291, 375, 287, 
    61, 57, 146, 396, 428, 175, 171, 175, 208, 199, 
    175, 428, 199, 208, 175, 268, 312, 271, 38, 41, 
    82, 311, 271, 312, 81, 82, 41, 444, 445, 283, 
    224, 53, 225, 276, 283, 445, 46, 225, 53, 254, 
    339, 373, 24, 144, 110, 390, 373, 339, 163, 110, 
    144, 295, 282, 296, 65, 66, 52, 334, 296, 282, 
    105, 52, 66, 346, 448, 347, 117, 118, 228, 449, 
    347, 448, 229, 228, 118, 454, 356, 447, 234, 227, 
    127, 264, 447, 356, 34, 127, 227, 336, 296, 337, 
    107, 108, 66, 299, 337, 296, 69, 66, 108, 151, 
    337, 10, 151, 10, 108, 338, 10, 337, 109, 108, 
    10, 278, 439, 294, 48, 64, 219, 455, 294, 439, 
    235, 219, 64, 407, 415, 292, 183, 62, 191, 308, 
    292, 415, 78, 191, 62, 358, 371, 429, 129, 209, 
    142, 355, 429, 371, 126, 142, 209, 345, 372, 340, 
    116, 111, 143, 265, 340, 372, 35, 143, 111, 388, 
    390, 466, 161, 246, 163, 249, 466, 390, 7, 163, 
    246, 352, 346, 280, 123, 50, 117, 347, 280, 346, 
    118, 117, 50, 295, 442, 282, 65, 52, 222, 443, 
    282, 442, 223, 222, 52, 19, 94, 354, 19, 125, 
    94, 370, 354, 94, 141, 94, 125, 295, 285, 442, 
    65, 222, 55, 441, 442, 285, 221, 55, 222, 419, 
    197, 248, 196, 3, 197, 195, 248, 197, 195, 197, 
    3, 359, 263, 255, 130, 25, 33, 249, 255, 263, 
    7, 33, 25, 275, 274, 440, 45, 220, 44, 457, 
    440, 274, 237, 44, 220, 300, 383, 301, 70, 71, 
    156, 368, 301, 383, 139, 156, 71, 417, 351, 465, 
    193, 245, 122, 412, 465, 351, 188, 122, 245, 466, 
    263, 467, 246, 247, 33, 359, 467, 263, 130, 33, 
    247, 389, 251, 368, 162, 139, 21, 301, 368, 251, 
    71, 21, 139, 374, 386, 380, 145, 153, 159, 385, 
    380, 386, 158, 159, 153, 379, 394, 378, 150, 149, 
    169, 395, 378, 394, 170, 169, 149, 351, 419, 412, 
    122, 188, 196, 399, 412, 419, 174, 196, 188, 426, 
    322, 436, 206, 216, 92, 410, 436, 322, 186, 92, 
    216, 387, 373, 388, 160, 161, 144, 390, 388, 373, 
    163, 144, 161, 393, 326, 164, 167, 164, 97, 2, 
    164, 326, 2, 97, 164, 354, 370, 461, 125, 241, 
    141, 462, 461, 370, 242, 141, 241, 0, 267, 164, 
    0, 164, 37, 393, 164, 267, 167, 37, 164, 11, 
    12, 302, 11, 72, 12, 268, 302, 12, 38, 12, 
    72, 386, 374, 387, 159, 160, 145, 373, 387, 374, 
    144, 145, 160, 12, 13, 268, 12, 38, 13, 312, 
    268, 13, 82, 13, 38, 293, 300, 298, 63, 68, 
    70, 301, 298, 300, 71, 70, 68, 340, 265, 261, 
    111, 31, 35, 446, 261, 265, 226, 35, 31, 380, 
    385, 381, 153, 154, 158, 384, 381, 385, 157, 158, 
    154, 280, 330, 425, 50, 205, 101, 266, 425, 330, 
    36, 101, 205, 423, 391, 426, 203, 206, 165, 322, 
    426, 391, 92, 165, 206, 429, 355, 420, 209, 198, 
    126, 437, 420, 355, 217, 126, 198, 391, 327, 393, 
    165, 167, 98, 326, 393, 327, 97, 98, 167, 457, 
    438, 440, 237, 220, 218, 344, 440, 438, 115, 218, 
    220, 382, 362, 341, 155, 112, 133, 463, 341, 362, 
    243, 133, 112, 457, 461, 459, 237, 239, 241, 458, 
    459, 461, 238, 241, 239, 434, 430, 364, 214, 135, 
    210, 394, 364, 430, 169, 210, 135, 414, 463, 398, 
    190, 173, 243, 362, 398, 463, 133, 243, 173, 262, 
    428, 369, 32, 140, 208, 396, 369, 428, 171, 208, 
    140, 457, 274, 461, 237, 241, 44, 354, 461, 274, 
    125, 44, 241, 316, 403, 317, 86, 87, 179, 402, 
    317, 403, 178, 179, 87, 315, 404, 316, 85, 86, 
    180, 403, 316, 404, 179, 180, 86, 314, 405, 315, 
    84, 85, 181, 404, 315, 405, 180, 181, 85, 313, 
    406, 314, 83, 84, 182, 405, 314, 406, 181, 182, 
    84, 418, 406, 421, 194, 201, 182, 313, 421, 406, 
    83, 182, 201, 366, 401, 323, 137, 93, 177, 361, 
    323, 401, 132, 177, 93, 408, 407, 306, 184, 76, 
    183, 292, 306, 407, 62, 183, 76, 408, 306, 409, 
    184, 185, 76, 291, 409, 306, 61, 76, 185, 410, 
    409, 287, 186, 57, 185, 291, 287, 409, 61, 185, 
    57, 436, 410, 432, 216, 212, 186, 287, 432, 410, 
    57, 186, 212, 434, 416, 427, 214, 207, 192, 411, 
    427, 416, 187, 192, 207, 264, 368, 372, 34, 143, 
    139, 383, 372, 368, 156, 139, 143, 457, 459, 438, 
    237, 218, 239, 309, 438, 459, 79, 239, 218, 352, 
    376, 366, 123, 137, 147, 401, 366, 376, 177, 147, 
    137, 4, 1, 275, 4, 45, 1, 274, 275, 1, 
    44, 1, 45, 428, 262, 421, 208, 201, 32, 418, 
    421, 262, 194, 32, 201, 327, 358, 294, 98, 64, 
    129, 331, 294, 358, 102, 129, 64, 367, 435, 416, 
    138, 192, 215, 433, 416, 435, 213, 215, 192, 455, 
    439, 289, 235, 59, 219, 392, 289, 439, 166, 219, 
    59, 328, 462, 326, 99, 97, 242, 370, 326, 462, 
    141, 242, 97, 326, 370, 2, 97, 2, 141, 94, 
    2, 370, 94, 141, 2, 460, 455, 305, 240, 75, 
    235, 289, 305, 455, 59, 235, 75, 448, 339, 449, 
    228, 229, 110, 254, 449, 339, 24, 110, 229, 261, 
    446, 255, 31, 25, 226, 359, 255, 446, 130, 226, 
    25, 449, 254, 450, 229, 230, 24, 253, 450, 254, 
    23, 24, 230, 450, 253, 451, 230, 231, 23, 252, 
    451, 253, 22, 23, 231, 451, 252, 452, 231, 232, 
    22, 256, 452, 252, 26, 22, 232, 256, 341, 452, 
    26, 232, 112, 453, 452, 341, 233, 112, 232, 413, 
    464, 414, 189, 190, 244, 463, 414, 464, 243, 244, 
    190, 441, 413, 286, 221, 56, 189, 414, 286, 413, 
    190, 189, 56, 441, 286, 442, 221, 222, 56, 258, 
    442, 286, 28, 56, 222, 442, 258, 443, 222, 223, 
    28, 257, 443, 258, 27, 28, 223, 444, 443, 259, 
    224, 29, 223, 257, 259, 443, 27, 223, 29, 259, 
    260, 444, 29, 224, 30, 445, 444, 260, 225, 30, 
    224, 260, 467, 445, 30, 225, 247, 342, 445, 467, 
    113, 247, 225, 250, 309, 458, 20, 238, 79, 459, 
    458, 309, 239, 79, 238, 290, 305, 392, 60, 166, 
    75, 289, 392, 305, 59, 75, 166, 460, 305, 328, 
    240, 99, 75, 290, 328, 305, 60, 75, 99, 376, 
    433, 401, 147, 177, 213, 435, 401, 433, 215, 213, 
    177, 250, 290, 309, 20, 79, 60, 392, 309, 290, 
    166, 60, 79, 411, 416, 376, 187, 147, 192, 433, 
    376, 416, 213, 192, 147, 341, 463, 453, 112, 233, 
    243, 464, 453, 463, 244, 243, 233, 453, 464, 357, 
    233, 128, 244, 465, 357, 464, 245, 244, 128, 412, 
    343, 465, 188, 245, 114, 357, 465, 343, 128, 114, 
    245, 437, 343, 399, 217, 174, 114, 412, 399, 343, 
    188, 114, 174, 363, 440, 360, 134, 131, 220, 344, 
    360, 440, 115, 220, 131, 456, 420, 399, 236, 174, 
    198, 437, 399, 420, 217, 198, 174, 456, 363, 420, 
    236, 198, 134, 360, 420, 363, 131, 134, 198, 361, 
    401, 288, 132, 58, 177, 435, 288, 401, 215, 177, 
    58, 353, 265, 383, 124, 156, 35, 372, 383, 265, 
    143, 35, 156, 255, 249, 339, 25, 110, 7, 390, 
    339, 249, 163, 7, 110, 261, 255, 448, 31, 228, 
    25, 339, 448, 255, 110, 25, 228, 14, 317, 13, 
    14, 13, 87, 312, 13, 317, 82, 87, 13, 317, 
    402, 312, 87, 82, 178, 311, 312, 402, 81, 178, 
    82, 402, 318, 311, 178, 81, 88, 310, 311, 318, 
    80, 88, 81, 318, 324, 310, 88, 80, 95, 415, 
    310, 324, 191, 95, 80
];



// Combined constant
const all_facemesh = {
  face_vertices,
  facemesh_lips,
  facemesh_left_eye,
  facemesh_left_iris,
  facemesh_left_eyebrow,
  facemesh_right_eye,
  facemesh_right_eyebrow,
  facemesh_right_iris,
  facemesh_nose
};

// Create a dictionary to map part names to materials
const partMaterials = {
  face_vertices: new THREE.MeshStandardMaterial({ color: 0xFF0000, roughness: 1, metalness: 0 }), // Red material for lips
  facemesh_lips: new THREE.MeshStandardMaterial({ color: 0xFF0000, roughness: 1, metalness: 0 }), // Red material for lips
  facemesh_left_eye: new THREE.MeshStandardMaterial({ color: 0x00FF00, roughness: 1, metalness: 0 }), // Green material for left eye
  facemesh_left_iris: new THREE.MeshStandardMaterial({ color: 0xFFFF00, roughness: 1, metalness: 0 }), // Yellow material for left iris
  facemesh_left_eyebrow: new THREE.MeshStandardMaterial({ color: 0x0000FF, roughness: 1, metalness: 0 }), // Blue material for left eyebrow
  facemesh_right_eye: new THREE.MeshStandardMaterial({ color: 0xFF00FF, roughness: 1, metalness: 0 }), // Magenta material for right eye
  facemesh_right_eyebrow: new THREE.MeshStandardMaterial({ color: 0x00FFFF, roughness: 1, metalness: 0 }), // Cyan material for right eyebrow
  facemesh_right_iris: new THREE.MeshStandardMaterial({ color: 0xFFFFFF, roughness: 1, metalness: 0 }), // White material for right iris
  facemesh_nose: new THREE.MeshStandardMaterial({ color: 0x888888, roughness: 1, metalness: 0 }) // Gray material for nose
};




const video = document.createElement( 'video' );
const enableWebcamButton = document.getElementById("captureHandleButton");
const enablePredictionButton = document.getElementById("capturePredictionButton");
let webcamPredict = false;
let webcamAvail = false;
let line;
let detectedModelMode = true;
let mouseHelper;
let mesh;
let meshClone;
let stats;
let faceMesh;
let faceWireframe;
let faceTransparent;
let faceSilver;
let faceGold;
let facePoint;
let videomesh;
let capturing = false;
let isActivate = false;


// Set initial condition for buttons
enablePredictionButton.disabled = true;

const texture = new THREE.VideoTexture( video );
texture.colorSpace = THREE.SRGBColorSpace;

const geometry = new THREE.PlaneGeometry( 1, 1 );
const material = new THREE.MeshBasicMaterial( { map: texture, depthWrite: false } );
videomesh = new THREE.Mesh( geometry, material );


const intersection = {
  intersects: false,
  point: new THREE.Vector3(),
  normal: new THREE.Vector3()
};
const mouse = new THREE.Vector2();
const intersects = [];

const textureLoader = new THREE.TextureLoader();
const decalDiffuse = textureLoader.load('../static/src/lib/THREEJS/examples/textures/decal/decal-diffuse.png');
decalDiffuse.encoding = THREE.sRGBEncoding;
const decalNormal = textureLoader.load('../static/src/lib/THREEJS/examples/textures/decal/decal-normal.jpg');

const decalMaterial = new THREE.MeshPhongMaterial({
  specular: 0x444444,
  map: decalDiffuse,
  normalMap: decalNormal,
  normalScale: new THREE.Vector2(1, 1),
  shininess: 30,
  transparent: true,
  depthTest: true,
  depthWrite: false,
  polygonOffset: true,
  polygonOffsetFactor: -4,
  wireframe: false
});

const decals = [];

const position = new THREE.Vector3();
const orientation = new THREE.Euler();
const size = new THREE.Vector3(1, 1, 1);

const params = {
  minScale: 10,
  maxScale: 20,
  rotate: true,
  clear: function () {
  removeDecals();
  }
};


//cubemap
const path = '../static/src/lib/THREEJS/examples/textures/cube/SwedishRoyalCastle/';
const format = '.jpg';
const urls = [
  path + 'px' + format, path + 'nx' + format,
  path + 'py' + format, path + 'ny' + format,
  path + 'pz' + format, path + 'nz' + format
];

const reflectionCube = new THREE.CubeTextureLoader().load( urls );
const refractionCube = new THREE.CubeTextureLoader().load( urls );
refractionCube.mapping = THREE.CubeRefractionMapping;



//materials
const cubeMaterial3 = new THREE.MeshLambertMaterial( { color: 0xffaa00, envMap: reflectionCube, combine: THREE.MixOperation, reflectivity: 0.3 } );
const cubeMaterial2 = new THREE.MeshLambertMaterial( { color: 0xfff700, envMap: refractionCube, refractionRatio: 0.95 } );
const cubeMaterial1 = new THREE.MeshLambertMaterial( { color: 0xffffff, envMap: reflectionCube } );


// Load Mediapipe model
const filesetResolver = await FilesetResolver.forVisionTasks(
  'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm'
);

const faceLandmarker = await FaceLandmarker.createFromOptions( filesetResolver, {
  baseOptions: {
    modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task',
    delegate: 'GPU'
  },
  outputFaceBlendshapes: true,
  outputFacialTransformationMatrixes: true,
  runningMode: 'VIDEO',
  numFaces: 1
} );


/********************************************************************
// Section 1: This part is for auto-capturing images from the webcam
********************************************************************/

function disableCam() {
  webcamAvail = false;
  webcamPredict = false;

  const stream = video.srcObject;
  if (stream) {
    const tracks = stream.getTracks();
    tracks.forEach(function (track) {
      track.stop();
    });
    video.srcObject = null; // Release the webcam stream
  }
  video.style.display ="none";
}

enablePredictionButton.addEventListener("click", function () {
  if (webcamPredict === true) {
    webcamPredict = false;
    enablePredictionButton.innerText = "ENABLE PREDICTIONS";
  } else {
    webcamPredict = true;
    enablePredictionButton.innerText = "DISABLE PREDICTIONS";
  }
});

function enableCam() {
 
  webcamAvail = true;
  const constraints = {
    video: true,
  };

  navigator.mediaDevices.getUserMedia(constraints).then(function (stream) {
    video.srcObject = stream;
    video.play();
    webcamPredict = false;
    enablePredictionButton.innerText = "ENABLE PREDICTIONS";
  });
}

function toggleCamera(video) {
  if (webcamAvail === true) {
    webcamAvail = false;
    enablePredictionButton.disabled = true;
    enableWebcamButton.innerText = "ENABLE CAMERA";
    scene.remove( videomesh );
    isActivate = false;
    disableCam();
  } else {
    webcamAvail = true;
    enablePredictionButton.disabled = false;
    enableWebcamButton.innerText = "DISABLE CAMERA";
    enablePredictionButton.innerText = "ENABLE PREDICTIONS";
     //remove previously added button
    if (button){
      scene.remove(button);
    }
    webcamPredict = false;
    isActivate = true;
    scene.add( videomesh );
    enableCam();
  }
  console.log("webcamAvail", webcamAvail);
}

function hasGetUserMedia() {
  return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
}

 // wants to activate it.
if (hasGetUserMedia()) {
  enableWebcamButton.addEventListener("click", toggleCamera);
} else {
  console.warn("getUserMedia() is not supported by your browser");
}


// Create button material and geometry
const buttonMaterial = new THREE.MeshBasicMaterial({ map: createButtonTexture('Download') });
const buttonGeometry = new THREE.PlaneGeometry(1, 0.5); // Adjust size as needed

// Create button mesh
const button = new THREE.Mesh(buttonGeometry, buttonMaterial);
button.position.set(-0.1, 0, -0.1); // Initial position relative to the camera

// Function to create a texture with text using HTML and CSS
function createButtonTexture(text) {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  const width = 100; // Adjust texture width
  const height = 50; // Adjust texture height

  // Set canvas dimensions
  canvas.width = width;
  canvas.height = height;

  // Customize the button appearance using CSS
  const buttonStyle = `
    background-color: #ff0000; /* Button background color */
    color: #ffffff; /* Text color */
    font-size: 14px; /* Text font size */
    text-align: center; /* Text alignment */
  `;

  // Draw the button with mirrored text using the specified CSS styles
  context.fillStyle = 'rgba(0, 0, 0, 0)'; // Transparent background
  context.fillRect(0, 0, width, height);
  context.font = '14px Arial';
  context.fillStyle = '#ff0000'; // Button background color
  context.fillRect(1, 1, width - 2, height - 2);


   // Create a mirror image of the text and position it below the original text
  context.scale(-1, 1); // Mirror vertically
  context.fillStyle = '#ffffff'; // Text color
  context.fillText(text, -width / 2-25, -height / 2 + 50);


  // Create a texture from the canvas
  const texture = new THREE.CanvasTexture(canvas);

  return texture;
}



const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
document.body.appendChild( renderer.domElement );

 stats = new Stats();
 document.body.appendChild( stats.dom );

const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 100);
camera.position.z = 5;
const camera_pos = camera.position;
const camera_rot = camera.rotation;


const scene = new THREE.Scene();
scene.scale.x = - 1;

const environment = new RoomEnvironment( renderer );
const pmremGenerator = new THREE.PMREMGenerator( renderer );

scene.background = new THREE.Color( 0x666666 );
scene.environment = pmremGenerator.fromScene( environment ).texture;



animate();


const controls = new OrbitControls( camera, renderer.domElement );
controls.saveState();

// Create GUI controls
const gui = new GUI();

const raycastFolder = gui.addFolder('Raycast Controls');

const raycastParams = {
  enableRaycast: false,
};

const animationFolder = gui.addFolder('Animation Controls');
const animationParams = {
  enableRealTimeAnimation: true,
};

// Add event listeners to control raycasting and animation based on GUI settings
raycastFolder.open();
animationFolder.open();

// Wrap the boolean property in an object
const raycastController = {
  enableRaycast: raycastParams.enableRaycast,
};

// Wrap the boolean property in an object
const animationController = {
  enableRealTimeAnimation: animationParams.enableRealTimeAnimation,
};

animationParams.enableRealTimeAnimation = true;
raycastParams.enableRaycast = false;

animationFolder.add(animationController, 'enableRealTimeAnimation').name('Enable Animation').onChange(function (value) {
if (webcamAvail === true){
// Check if the mesh exists before removing it
  if (value) {
    detectedModelMode = true;
    scene.remove(faceMesh);
    scene.remove(facePoint);
    scene.remove(faceWireframe);
    scene.remove(faceSilver);
    scene.remove(faceGold);
    scene.remove(faceTransparent);
    controls.enabled = true;
    if (button){
    scene.remove(button);
    }
    loadObject();
  } else {
    resetDisplay();
    scene.remove(mesh);
    displayFacePointCloud();
  }
}
});


raycastFolder.add(raycastController, 'enableRaycast').name('Enable Raycast').onChange(function (value) {
  if (value) {
    isActivate = true;
    playActivate();
    }else{
    isActivate = false;
    scene.remove(line);
    removeDecals();
    }
});


raycastFolder.add( params, 'minScale', 1, 30 );
raycastFolder.add( params, 'maxScale', 1, 30 );
raycastFolder.add( params, 'rotate' );
raycastFolder.add( params, 'clear' );


const displayFolder = gui.addFolder('Display Controls');

const displayParams = {
  displayOption: 'PointCloud', // Default option
};

const displayOptionControl = displayFolder.add(displayParams, 'displayOption', ['PointCloud', 'Mesh', 'Wire Frame','Transparent','Silver','Gold']);

// Add an event listener to handle the selected option
displayOptionControl.onChange(function (selectedOption) {
  //remove previously added button
  if (button){
    scene.remove(button);
  }
// Handle the selected option
if (selectedOption === 'PointCloud') {
    resetDisplay();
    scene.remove(faceMesh);
    scene.remove(faceWireframe);
    scene.remove(faceTransparent);
    scene.remove(faceSilver);
    scene.remove(faceGold);
    scene.add(facePoint);
    scene.add(button);
    displayFacePointCloud();
    document.addEventListener('click', function(event) {
    onClick(event, facePoint);
    });
} else if (selectedOption === 'Mesh') {
    resetDisplay();
    scene.remove(facePoint);
    scene.remove(faceWireframe);
    scene.remove(faceTransparent);
    scene.remove(faceSilver);
    scene.remove(faceGold);
    scene.add(faceMesh);
    // Add the button to your scene
    scene.add(button);
    displayFaceMesh();
    document.addEventListener('click', function(event) {
    onClick(event, faceMesh);
    });
} else if (selectedOption === 'Wire Frame') {
    resetDisplay();
    scene.remove(facePoint);
    scene.remove(faceTransparent);
    scene.remove(faceMesh);
    scene.remove(faceGold);
    scene.remove(faceSilver);
    scene.add(faceWireframe);
    scene.add(button);
    displayFaceWireFrame();
    document.addEventListener('click', function(event) {
    onClick(event, faceWireframe);
     });
} else if (selectedOption === 'Transparent') {
    resetDisplay();
    scene.remove(facePoint);
    scene.remove(faceSilver);
    scene.remove(faceGold);
    scene.remove(faceWireframe);
    scene.remove(faceMesh);
    scene.add(faceTransparent);
    scene.add(button);
    displayFaceTransparent();
    document.addEventListener('click', function(event) {
    onClick(event, faceTransparent);
     });
}else if (selectedOption === 'Silver') {
    resetDisplay();
    scene.remove(facePoint);
    scene.remove(faceWireframe);
    scene.remove(faceMesh);
    scene.remove(faceGold);
    scene.remove(faceTransparent);
    scene.add(faceSilver);
    scene.add(button);
    displayFaceSilver();
    document.addEventListener('click', function(event) {
    onClick(event, faceSilver);
     });
} else if (selectedOption === 'Gold') {
    resetDisplay();
    scene.remove(facePoint);
    scene.remove(faceWireframe);
    scene.remove(faceMesh);
    scene.remove(faceSilver);
    scene.remove(faceTransparent);
    scene.add(faceGold);
    scene.add(button);
    displayFaceGold();
    document.addEventListener('click', function(event) {
    onClick(event, faceGold);
     });
  }
});


function resetDisplay() {
  if (mesh) {
    scene.remove(mesh);
  }

  detectedModelMode = false;
  controls.reset();
  controls.enabled = false;
}



const displayButtonFolder = gui.addFolder('Button Controls');

// Add event listeners to control raycasting and animation based on GUI settings
displayButtonFolder.open();



const displayButtonParams = {
  displayButtonEnable: true, // Default option
};


// Wrap the boolean property in an object
const displayButtonController = {
  displayButtonEnable: displayButtonParams.displayButtonEnable,
};

displayButtonFolder.add(displayButtonController, 'displayButtonEnable').name('Display Button').onChange(function (value) {
  if (button) {
    if (value) {
      button.visible = true; // Show the button
      button.userData.enabled = true; // Enable the button
    } else {
      button.visible = false; // Hide the button
      button.userData.enabled = false; // Disable the button
    }
  }
});


// Call loadObject() initially
if (animationParams.enableRealTimeAnimation) {
  loadObject();
}

// Call loadObject() initially
if (displayParams.displayOption==="PointCloud") {
  if (webcamAvail && !detectedModelMode){
  resetDisplay();
  displayFacePointCloud();
  scene.add(button);
}
}


function loadObject(){
const ktx2Loader = new KTX2Loader()
  .setTranscoderPath('../static/src/lib/THREEJS/examples/jsm/libs/basis/')
  .detectSupport(renderer);

 const gltfLoader = new GLTFLoader()
  .setKTX2Loader(ktx2Loader)
  .setMeshoptDecoder(MeshoptDecoder)
  .load('../static/src/lib/THREEJS/examples/models/gltf/facecap.glb', (gltf) => {
    mesh = gltf.scene.children[0];
    mesh.name = 'faceMesh';
    scene.add(mesh);

    const head = mesh.getObjectByName('mesh_2');
    head.material = new THREE.MeshNormalMaterial();

    const gui = new GUI();
    gui.close();

    const influences = head.morphTargetInfluences;

    for (const [key, value] of Object.entries(head.morphTargetDictionary)) {
      gui.add(influences, value, 0, 1, 0.01)
        .name(key.replace('blendShape1.', ''))
        .listen(influences);
    }    

    renderer.setAnimationLoop(animation);

  });

}


// This fucntion is to display pointcloud from face detected
async function displayFacePointCloud() {
  detectedModelMode = false;

  if (webcamPredict === true && webcamAvail === true && detectedModelMode === false && displayParams.displayOption==="PointCloud") {

    if (video.readyState >= HTMLMediaElement.HAVE_METADATA) {

      const results = faceLandmarker.detectForVideo(video, Date.now());

      const verticesArray = []; // Array to store vertices

       // Check if the faceMesh exists, and if not, create it
      if (!facePoint) {
        const pointCloudMaterial = new THREE.PointsMaterial({ size: 0.2, color: 0x0000ff }); // Adjust size and color as needed
        facePoint = new THREE.Points(new THREE.BufferGeometry(), pointCloudMaterial);
        facePoint.position.x -= 17.5;
        facePoint.position.y += 12.5;
        facePoint.position.z -= 20;
        scene.add(facePoint);
      }

      // Iterate through each point index in face_vertices
      for (let i = 0; i < face_vertices.length; i++) {
        const index = face_vertices[i];
        const landmarks = results.faceLandmarks; // Get all landmarks
        // Check if the landmarks array exists and has the expected index
        if (landmarks && landmarks[0] && landmarks[0][index]) {
          const landmark = landmarks[0][index];
          // Check if landmark coordinates are valid and not NaN
          if (!isNaN(landmark.x) && !isNaN(landmark.y) && !isNaN(landmark.z)) {
            // Push the [x, y, z] coordinates to the verticesArray
            verticesArray.push(landmark.x * 35, landmark.y * 25, landmark.z * 30);
          } else {
            // If landmark is undefined or contains NaN values, push a placeholder [0, 0, 0]
            verticesArray.push(0, 0, 0);
          }
          // Your code to process the landmark here
        } else {
          console.log("Landmark not found for index", index);
        }
      }

      // Check if there are enough vertices to create the point cloud
      if (verticesArray.length > 0 && facePoint.geometry) {
        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.Float32BufferAttribute(verticesArray, 3));
        facePoint.geometry = geometry;
        facePoint.geometry.rotateX(Math.PI);
        facePoint.geometry.attributes.position.needsUpdate = true;
      }

           
    }

    // Synchronize the faceMesh's rotation with the camera's rotation

    videomesh.scale.x = video.videoWidth / 100;
    videomesh.scale.y = video.videoHeight / 100;

    renderer.render( scene, camera );

    renderer.setAnimationLoop(displayFacePointCloud);
  }
}




// This fucntion is to display mesh from face detected

/* Further development involves UV mapping/texture mapping*/

async function displayFaceMesh() {
  detectedModelMode = false;
  let scale = 1;

  if (webcamPredict === true && webcamAvail === true && detectedModelMode === false  && displayParams.displayOption==="Mesh") {
    if (video.readyState >= HTMLMediaElement.HAVE_METADATA) {
      const results = faceLandmarker.detectForVideo(video, Date.now());

      const verticesArray = []; // Array to store vertices

      // Check if the faceMesh exists, and if not, create it
      if (!faceMesh) {
        const faceMaterial = new THREE.MeshStandardMaterial({
          color: 0xffffff, // Face color
          roughness: 1, // Adjust roughness as needed
          metalness: 0, // Adjust metalness as needed
        });

        faceMesh = new THREE.Mesh(new THREE.BufferGeometry(), faceMaterial);
        faceMesh.name = 'faceMesh';
        faceMesh.position.x -= 17.5;
        faceMesh.position.y += 12.5;
        faceMesh.position.z -= 20;
        scene.add(faceMesh);
      }

      // Iterate through each point index in face_vertices
      for (let i = 0; i < face_vertices.length; i++) {
        const index = face_vertices[i];
        const landmarks = results.faceLandmarks; // Get all landmarks

        // Check if the landmarks array exists and has the expected index
        if (landmarks && landmarks[0] && landmarks[0][index]) {
          const landmark = landmarks[0][index];

          // Check if landmark coordinates are valid and not NaN
          if (!isNaN(landmark.x) && !isNaN(landmark.y) && !isNaN(landmark.z)) {
            // Push the [x, y, z] coordinates to the verticesArray
            verticesArray.push(landmark.x * 35, landmark.y * 25, landmark.z * 30);
          } else {
            // If landmark is undefined or contains NaN values, push a placeholder [0, 0, 0]
            verticesArray.push(0, 0, 0);
          }
          // Your code to process the landmark here
        } else {
          console.log("Landmark not found for index", index);
        }
      }

      // Check if there are enough vertices to create the point cloud
      if (verticesArray.length > 0) {
        const faceGeometry = new THREE.BufferGeometry(); // Create a new geometry
        faceGeometry.setAttribute('position', new THREE.Float32BufferAttribute(verticesArray, 3));
        faceGeometry.scale(scale, scale, scale);
        faceGeometry.rotateX(Math.PI);
        faceGeometry.computeVertexNormals();
        faceGeometry.attributes.position.needsUpdate = true;

        // Update the geometry of the faceMesh
        faceMesh.geometry = faceGeometry;
      }
    }

    // Synchronize the faceMesh's rotation with the camera's rotation
    videomesh.scale.x = video.videoWidth / 100;
    videomesh.scale.y = video.videoHeight / 100;

    renderer.render(scene, camera);

    renderer.setAnimationLoop(displayFaceMesh);
  }
}





// This fucntion is to display wireframe from face detected

/* Further development involves UV mapping/texture mapping*/

async function displayFaceWireFrame() {
  detectedModelMode = false;
  let scale = 1;

  if (
    webcamPredict === true &&
    webcamAvail === true &&
    detectedModelMode === false &&
    displayParams.displayOption === "Wire Frame"
  ) {
    if (video.readyState >= HTMLMediaElement.HAVE_METADATA) {
      const results = faceLandmarker.detectForVideo(video, Date.now());

      const verticesArray = []; // Array to store vertices

      // Check if the faceWireframe exists, and if not, create it
      if (!faceWireframe) {
        const wireframeMaterial = new THREE.MeshBasicMaterial({
          color: 0xffffff, // Wireframe color
          wireframe: true, // Enable wireframe mode
        });

        faceWireframe = new THREE.Mesh(new THREE.BufferGeometry(), wireframeMaterial);
        faceWireframe.position.x -= 17.5;
        faceWireframe.position.y += 12.5;
        faceWireframe.position.z -= 20;
        scene.add(faceWireframe);
      }

      // Iterate through each point index in face_vertices
      for (let i = 0; i < face_vertices.length; i++) {
        const index = face_vertices[i];
        const landmarks = results.faceLandmarks; // Get all landmarks

        // Check if the landmarks array exists and has the expected index
        if (landmarks && landmarks[0] && landmarks[0][index]) {
          const landmark = landmarks[0][index];

          // Check if landmark coordinates are valid and not NaN
          if (!isNaN(landmark.x) && !isNaN(landmark.y) && !isNaN(landmark.z)) {
            // Push the [x, y, z] coordinates to the verticesArray
            verticesArray.push(landmark.x * 35, landmark.y * 25, landmark.z * 30);
          } else {
            // If landmark is undefined or contains NaN values, push a placeholder [0, 0, 0]
            verticesArray.push(0, 0, 0);
          }
          // Your code to process the landmark here
        } else {
          console.log("Landmark not found for index", index);
        }
      }

      // Check if there are enough vertices to create the wireframe
      if (verticesArray.length > 0) {
        const faceGeometry = new THREE.BufferGeometry(); // Create a new geometry
        faceGeometry.setAttribute('position', new THREE.Float32BufferAttribute(verticesArray, 3));
        faceGeometry.scale(scale, scale, scale);
        faceGeometry.rotateX(Math.PI);
        faceGeometry.computeVertexNormals();
        faceGeometry.attributes.position.needsUpdate = true;

        // Update the geometry of the faceWireframe
        faceWireframe.geometry = faceGeometry;
      }
    }

    // Synchronize the faceWireframe's rotation with the camera's rotation
    videomesh.scale.x = video.videoWidth / 100;
    videomesh.scale.y = video.videoHeight / 100;

    renderer.render(scene, camera);

    renderer.setAnimationLoop(displayFaceWireFrame);
  }
}



// This fucntion is to display transparent from face detected

/* Further development involves UV mapping/texture mapping*/

async function displayFaceTransparent() {
  detectedModelMode = false;
  let scale = 1;

  if (
    webcamPredict === true &&
    webcamAvail === true &&
    detectedModelMode === false &&
    displayParams.displayOption === "Transparent"
  ) {
    if (video.readyState >= HTMLMediaElement.HAVE_METADATA) {
      const results = faceLandmarker.detectForVideo(video, Date.now());

      const verticesArray = []; // Array to store vertices

      // Check if the faceWireframe exists, and if not, create it
      if (!faceTransparent) {
        faceTransparent = new THREE.Mesh(new THREE.BufferGeometry(), cubeMaterial3);
        faceTransparent.position.x -= 17.5;
        faceTransparent.position.y += 12.5;
        faceTransparent.position.z -= 20;
        scene.add(faceTransparent);
      }

      // Iterate through each point index in face_vertices
      for (let i = 0; i < face_vertices.length; i++) {
        const index = face_vertices[i];
        const landmarks = results.faceLandmarks; // Get all landmarks

        // Check if the landmarks array exists and has the expected index
        if (landmarks && landmarks[0] && landmarks[0][index]) {
          const landmark = landmarks[0][index];

          // Check if landmark coordinates are valid and not NaN
          if (!isNaN(landmark.x) && !isNaN(landmark.y) && !isNaN(landmark.z)) {
            // Push the [x, y, z] coordinates to the verticesArray
            verticesArray.push(landmark.x * 35, landmark.y * 25, landmark.z * 30);
          } else {
            // If landmark is undefined or contains NaN values, push a placeholder [0, 0, 0]
            verticesArray.push(0, 0, 0);
          }
          // Your code to process the landmark here
        } else {
          console.log("Landmark not found for index", index);
        }
      }

      // Check if there are enough vertices to create the wireframe
      if (verticesArray.length > 0) {
        const faceGeometry = new THREE.BufferGeometry(); // Create a new geometry
        faceGeometry.setAttribute('position', new THREE.Float32BufferAttribute(verticesArray, 3));
        faceGeometry.scale(scale, scale, scale);
        faceGeometry.rotateX(Math.PI);
        faceGeometry.computeVertexNormals();
        faceGeometry.attributes.position.needsUpdate = true;

        // Update the geometry of the faceWireframe
        faceTransparent.geometry = faceGeometry;
      }
    }

    // Synchronize the faceWireframe's rotation with the camera's rotation
    videomesh.scale.x = video.videoWidth / 100;
    videomesh.scale.y = video.videoHeight / 100;

    renderer.render(scene, camera);

    renderer.setAnimationLoop(displayFaceTransparent);
  }
}



// This fucntion is to display silver from face detected

/* Further development involves UV mapping/texture mapping*/

async function displayFaceSilver() {
  detectedModelMode = false;
  let scale = 1;

  if (
    webcamPredict === true &&
    webcamAvail === true &&
    detectedModelMode === false &&
    displayParams.displayOption === "Silver"
  ) {
    if (video.readyState >= HTMLMediaElement.HAVE_METADATA) {
      const results = faceLandmarker.detectForVideo(video, Date.now());

      const verticesArray = []; // Array to store vertices

      // Check if the faceWireframe exists, and if not, create it
      if (!faceSilver) {
        faceSilver = new THREE.Mesh(new THREE.BufferGeometry(), cubeMaterial2);
        faceSilver.position.x -= 17.5;
        faceSilver.position.y += 12.5;
        faceSilver.position.z -= 20;
        scene.add(faceSilver);
      }

      // Iterate through each point index in face_vertices
      for (let i = 0; i < face_vertices.length; i++) {
        const index = face_vertices[i];
        const landmarks = results.faceLandmarks; // Get all landmarks

        // Check if the landmarks array exists and has the expected index
        if (landmarks && landmarks[0] && landmarks[0][index]) {
          const landmark = landmarks[0][index];

          // Check if landmark coordinates are valid and not NaN
          if (!isNaN(landmark.x) && !isNaN(landmark.y) && !isNaN(landmark.z)) {
            // Push the [x, y, z] coordinates to the verticesArray
            verticesArray.push(landmark.x * 35, landmark.y * 25, landmark.z * 30);
          } else {
            // If landmark is undefined or contains NaN values, push a placeholder [0, 0, 0]
            verticesArray.push(0, 0, 0);
          }
          // Your code to process the landmark here
        } else {
          console.log("Landmark not found for index", index);
        }
      }

      // Check if there are enough vertices to create the wireframe
      if (verticesArray.length > 0) {
        const faceGeometry = new THREE.BufferGeometry(); // Create a new geometry
        faceGeometry.setAttribute('position', new THREE.Float32BufferAttribute(verticesArray, 3));
        faceGeometry.scale(scale, scale, scale);
        faceGeometry.rotateX(Math.PI);
        faceGeometry.computeVertexNormals();
        faceGeometry.attributes.position.needsUpdate = true;

        // Update the geometry of the faceWireframe
        faceSilver.geometry = faceGeometry;
      }
    }

    // Synchronize the faceWireframe's rotation with the camera's rotation
    videomesh.scale.x = video.videoWidth / 100;
    videomesh.scale.y = video.videoHeight / 100;

    renderer.render(scene, camera);

    renderer.setAnimationLoop(displayFaceSilver);
  }
}




// This fucntion is to display transparent from face detected

/* Further development involves UV mapping/texture mapping*/

async function displayFaceGold() {
  detectedModelMode = false;
  let scale = 1;

  if (
    webcamPredict === true &&
    webcamAvail === true &&
    detectedModelMode === false &&
    displayParams.displayOption === "Gold"
  ) {
    if (video.readyState >= HTMLMediaElement.HAVE_METADATA) {
      const results = faceLandmarker.detectForVideo(video, Date.now());

      const verticesArray = []; // Array to store vertices

      // Check if the faceWireframe exists, and if not, create it
      if (!faceGold) {
        faceGold = new THREE.Mesh(new THREE.BufferGeometry(), cubeMaterial1);
        faceGold.position.x -= 17.5;
        faceGold.position.y += 12.5;
        faceGold.position.z -= 20;
        scene.add(faceGold);
      }

      // Iterate through each point index in face_vertices
      for (let i = 0; i < face_vertices.length; i++) {
        const index = face_vertices[i];
        const landmarks = results.faceLandmarks; // Get all landmarks

        // Check if the landmarks array exists and has the expected index
        if (landmarks && landmarks[0] && landmarks[0][index]) {
          const landmark = landmarks[0][index];

          // Check if landmark coordinates are valid and not NaN
          if (!isNaN(landmark.x) && !isNaN(landmark.y) && !isNaN(landmark.z)) {
            // Push the [x, y, z] coordinates to the verticesArray
            verticesArray.push(landmark.x * 35, landmark.y * 25, landmark.z * 30);
          } else {
            // If landmark is undefined or contains NaN values, push a placeholder [0, 0, 0]
            verticesArray.push(0, 0, 0);
          }
          // Your code to process the landmark here
        } else {
          console.log("Landmark not found for index", index);
        }
      }

      // Check if there are enough vertices to create the wireframe
      if (verticesArray.length > 0) {
        const faceGeometry = new THREE.BufferGeometry(); // Create a new geometry
        faceGeometry.setAttribute('position', new THREE.Float32BufferAttribute(verticesArray, 3));
        faceGeometry.scale(scale, scale, scale);
        faceGeometry.rotateX(Math.PI);
        faceGeometry.computeVertexNormals();
        faceGeometry.attributes.position.needsUpdate = true;

        // Update the geometry of the faceWireframe
        faceGold.geometry = faceGeometry;
      }
    }

    // Synchronize the faceWireframe's rotation with the camera's rotation
    videomesh.scale.x = video.videoWidth / 100;
    videomesh.scale.y = video.videoHeight / 100;

    renderer.render(scene, camera);

    renderer.setAnimationLoop(displayFaceGold);
  }
}

const transform = new THREE.Object3D();


// This fucntion is to display/ transform/loop render animation of imported 3d Object

function animation() {
  detectedModelMode = true;

  if (webcamPredict === true && webcamAvail === true && detectedModelMode===true) {

  if ( video.readyState >= HTMLMediaElement.HAVE_METADATA ) {

    const results = faceLandmarker.detectForVideo( video, Date.now() );

    if ( results.facialTransformationMatrixes.length > 0 ) {

      const facialTransformationMatrixes = results.facialTransformationMatrixes[ 0 ].data;

      transform.matrix.fromArray( facialTransformationMatrixes );
      transform.matrix.decompose( transform.position, transform.quaternion, transform.scale );

      const object = scene.getObjectByName( 'grp_transform' );
      if (object) {
      object.position.x = transform.position.x;
      object.position.y = transform.position.z + 40;
      object.position.z = - transform.position.y;

      object.rotation.x = transform.rotation.x;
      object.rotation.y = transform.rotation.z;
      object.rotation.z = - transform.rotation.y;

       }
    }

    if ( results.faceBlendshapes.length > 0  ) {

      const face = scene.getObjectByName( 'mesh_2' );

      if (face) {

      const faceBlendshapes = results.faceBlendshapes[ 0 ].categories;

      for ( const blendshape of faceBlendshapes ) {

        const categoryName = blendshape.categoryName;
        const score = blendshape.score;

        const index = face.morphTargetDictionary[ blendshapesMap[  categoryName ] ];

        if ( index !== undefined ) {

          face.morphTargetInfluences[ index ] = score;

        }

      }
      }
    }
  }

}

  videomesh.scale.x = video.videoWidth / 100;
  videomesh.scale.y = video.videoHeight / 100;

  renderer.render( scene, camera );

  controls.update();

}


/********************************************************************
// this part is to export the mesh
********************************************************************/

// Assuming you have a WebGLRenderer named 'renderer', a Scene named 'scene', and your face mesh named 'faceGold'.
// You also need to have a boolean flag 'capturing' to indicate if a capture is in progress.

const exportParams = {
      trs: false,
      onlyVisible: true,
      binary: false,
      maxTextureSize: 4096,
};

const link = document.createElement( 'a' );
  link.style.display = 'none';
  document.body.appendChild(link);

  function save( blob, filename ) {

  link.href = URL.createObjectURL( blob );
  link.download = filename;

  link.click();

}


function saveString( text, filename ) {

  save( new Blob( [ text ], { type: 'text/plain' } ), filename );

}


function saveArrayBuffer( buffer, filename ) {

  save( new Blob( [ buffer ], { type: 'application/octet-stream' } ), filename );

}


// Function to capture the current frame of faceGold
function captureFrame(input) {
  if (capturing) return;
  capturing = true;
  const gltfExporter = new GLTFExporter();

  if (input){
    const loadScene = initDownload(input);


  const options = {
    trs: exportParams.trs,
    onlyVisible: exportParams.onlyVisible,
    binary: exportParams.binary,
    maxTextureSize: exportParams.maxTextureSize
  };

  gltfExporter.parse(
    loadScene,
    function ( result ) {

      if ( result instanceof ArrayBuffer ) {

        saveArrayBuffer( result, 'scene.glb' );

      } else {

        const output = JSON.stringify( result, null, 2 );
        console.log( output );
        saveString( output, 'scene.gltf' );

      }

    },
    function ( error ) {

      console.log( 'An error happened during parsing', error );

    },
    options
  );
}

}


function initDownload(model){

        let camera1, scene1;
        let gridHelper;
  
        scene1 = new THREE.Scene();
        scene1.name = 'Scene1';

        // ---------------------------------------------------------------------
        // Perspective Camera
        // ---------------------------------------------------------------------

        camera1 = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 2000 );
        camera1.position.set( 600, 400, 100 );

        camera1.name = 'PerspectiveCamera';
        scene1.add( camera1 );

        // ---------------------------------------------------------------------
        // Ambient light
        // ---------------------------------------------------------------------
        const ambientLight = new THREE.AmbientLight( 0xcccccc );
        ambientLight.name = 'AmbientLight';
        scene1.add( ambientLight );

        // ---------------------------------------------------------------------
        // DirectLight
        // ---------------------------------------------------------------------
        const dirLight = new THREE.DirectionalLight( 0xffffff, 3 );
        dirLight.target.position.set( 0, 0, - 1 );
        dirLight.add( dirLight.target );
        dirLight.lookAt( - 1, - 1, 0 );
        dirLight.name = 'DirectionalLight';
        scene1.add( dirLight );

        // ---------------------------------------------------------------------
        // Grid
        // ---------------------------------------------------------------------
        gridHelper = new THREE.GridHelper( 2000, 20, 0xc1c1c1, 0x8d8d8d );
        gridHelper.position.y = - 50;
        gridHelper.name = 'Grid';
        scene1.add( gridHelper );

        // ---------------------------------------------------------------------
        // Axes
        // ---------------------------------------------------------------------
        const axes = new THREE.AxesHelper( 500 );
        axes.name = 'AxesHelper';
        scene1.add( axes );


        // ---------------------------------------------------------------------
        // Model
        // ---------------------------------------------------------------------
        scene1.add( model );


        return (scene1);
}


// Define the onClick function
function onClick(event, model) {

  // Create a raycaster to detect mouse clicks
  const raycaster = new THREE.Raycaster();

  const mouse = new THREE.Vector2();

  // Calculate the mouse coordinates in normalized device space (-1 to 1)
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  // Set the raycaster's origin at the camera's position
  raycaster.setFromCamera(mouse, camera);

  // Find intersected objects
  const intersects = raycaster.intersectObjects([button], true); // Wrap 'button' in an array

  if (intersects.length > 0) {
      // Download the glb model
      console.log("intersects", intersects);

     if (!capturing) {
        captureFrame(model);
      }
  }
}





function playActivate() {
  isActivate = true;

   // Clone the face geometry
  meshClone = mesh.clone();
  
  scene.add(meshClone);

  if (isActivate===true && webcamAvail===false) {

  // Create a raycaster to detect mouse clicks
  const raycaster = new THREE.Raycaster();


  const geometry = new THREE.BufferGeometry();
  geometry.setFromPoints( [ new THREE.Vector3(), new THREE.Vector3() ] );

  line = new THREE.Line( geometry, new THREE.LineBasicMaterial() );

  scene.add( line );

  mouseHelper = new THREE.Mesh( new THREE.BoxGeometry( 1, 1, 10 ), new THREE.MeshNormalMaterial() );
  mouseHelper.visible = false;
  scene.add( mouseHelper );

let moved = false;

controls.addEventListener( 'change', function () {

  moved = true;

} );

window.addEventListener( 'pointerdown', function () {

  moved = false;

} );

window.addEventListener( 'pointerup', function ( event ) {

  if ( moved === false ) {

    checkIntersection( event.clientX, event.clientY );

    if ( intersection.intersects ) shoot();

  }

} );



  window.addEventListener( 'pointermove', onPointerMove );

  function onPointerMove( event ) {

    if ( event.isPrimary ) {

      checkIntersection( event.clientX, event.clientY );

    }

  }



function checkIntersection( x, y ) {

  if ( meshClone === undefined ) return;

  mouse.x = ( x / window.innerWidth ) * 2 - 1;
  mouse.y = - ( y / window.innerHeight ) * 2 + 1;

  raycaster.setFromCamera( mouse, camera );

  // Create an array to store the objects you want to check for intersections
  const objectsToIntersect = [meshClone];

  // Use raycaster to find intersections with objectsToIntersect
  const intersects = raycaster.intersectObjects(objectsToIntersect, true);

  if ( intersects.length > 0 ) {
    const p = intersects[ 0 ].point;
    mouseHelper.position.copy( p );
    intersection.point.copy( p );
    const n = intersects[ 0 ].face.normal.clone();
    n.transformDirection( meshClone.matrixWorld );
    n.multiplyScalar( 1 );
    n.add( intersects[ 0 ].point );

    intersection.normal.copy( intersects[ 0 ].face.normal );
    mouseHelper.lookAt( n );

    const positions = line.geometry.attributes.position;
    positions.setXYZ( 0, p.x, p.y, p.z );
    positions.setXYZ( 1, n.x, n.y, n.z );
    positions.needsUpdate = true;

    intersection.intersects = true;

    intersects.length = 0;

  } else {

    intersection.intersects = false;

  }

}
function shoot() {
  position.copy(intersection.point);
  orientation.copy(mouseHelper.rotation);

  if (params.rotate) orientation.z = Math.random() * 2 * Math.PI;

  const scale = params.minScale + Math.random() * (params.maxScale - params.minScale);
  size.set(scale, scale, scale);

  // Create a new material for the decal
  const material = decalMaterial.clone();
  material.color.setHex(Math.random() * 0xffffff);


  const face_object = scene.getObjectByName('mesh_2');
    // Add mesh clone to the scene

  const m = new THREE.Mesh(new DecalGeometry(face_object, position, orientation, size), material);
  m.renderOrder = decals.length; // give decals a fixed render order


  decals.push(m);
  scene.add(m);
}
}

}

function removeDecals() {
  console.log("meshClone", meshClone);
  if (meshClone) {
    scene.remove(meshClone);
  }

  decals.forEach(function (d) {
    scene.remove(d);
  });

  decals.length = 0;
}
      


function animate() {

      requestAnimationFrame( animate );

      renderer.render( scene, camera );

      stats.update();

}




window.addEventListener('resize', function () {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});



