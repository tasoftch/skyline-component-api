<?php
/**
 * Copyright (c) 2019 TASoft Applications, Th. Abplanalp <info@tasoft.ch>
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

use Skyline\Component\Config\AbstractComponent;
use Skyline\Component\Config\CSSComponent;
use Skyline\Component\Config\JavaScriptPostLoadComponent;

$apiFileJS = __DIR__ . "/Components/js/skyline-api.min.js";
$apiFileCSS = __DIR__ . "/Components/css/skyline-api.min.css";
$apiFileJS_L = __DIR__ . "/Components/js/skyline-api.js.php";

return [
    "API" => [
        "js" => new JavaScriptPostLoadComponent(
        	...AbstractComponent::makeLocalFileComponentArguments(
        		"/Public/Skyline/skyline-api.min.js",
				$apiFileJS
			)
        ),
		'js-loader' => new JavaScriptPostLoadComponent(
			...AbstractComponent::makeLocalFileComponentArguments(
				"/Public/Skyline/skyline-api-loader.min.js",
				$apiFileJS_L,
					NULL,
					NULL
			)
		),
        "css" => new CSSComponent(
        	...AbstractComponent::makeLocalFileComponentArguments(
			"/Public/Skyline/skyline-api.min.css",
			$apiFileCSS,
			'sha384',
			NULL,
				"all"
		)),
        AbstractComponent::COMP_REQUIREMENTS => [
            'Skyline'
        ]
    ]
];