<template>
    <!-- v-loading="loading" -->
    <div class="editor" v-show="!loading">
        <!-- side tab -->
        <div class="menu-tab" v-if="tab && !loading">
            <!-- fonts tab -->
            <div v-if="fontsDialog" class="fonts-dialog">
                <div class="fonts-dialog-header">
                    <i class="close-fonts el-icon-close" v-on:click="fontsDialog = false"></i>
                </div>
                <div class="fonts-dialog-items">
                    <div class="font-item" v-for="(font, index) in fonts" :key="index" v-html="font.svgPreview"
                        v-on:click="setStyle({fontFamily: font.name}); fontsDialog = false">
                    </div>
                </div>
            </div>
            <!-- text tab -->
            <div class="tab" v-if="tab === 'text' && typeof activePage === 'number' && !activeSelection">
                <el-button plain v-on:click="addText({fontSize:40, text: language.addHeadingText})"
                    style="margin-bottom: 20px; text-align:left; width:100%; margin-left:0px; padding-left:10px; font-size:16pt; color:#fff; font-weight:bold;">
                    {{language.addHeadingText}}
                </el-button>
                <el-button plain v-on:click="addText({fontSize:25, text: language.addSubheadingText})"
                    style="margin-bottom: 20px; text-align:left; width:100%; margin-left:0px; padding-left:10px; font-size:11pt; color:#fff; font-weight:bold;">
                    {{language.addSubheadingText}}
                </el-button>
                <el-button plain v-on:click="addText({fontSize:12,  text: language.addBodyText})"
                    style="margin-bottom: 20px; text-align:left; width:100%; margin-left:0px; padding-left:10px; font-size:8pt; color:#fff; font-weight:bold;">
                    {{language.addBodyText}}
                </el-button>
            </div>
            <!-- pages tab -->
            <div class="tab" v-if="tab === 'pages' && !activeSelection">
                <div class="pages-container"
                    style="display:flex; flex-direction:row; flex-wrap: wrap; justify-content:space-between;">
                    <div class="page-item" v-on:click="pageDialog = true; pageForm.fill = '#ffffff'">
                        <div
                            style="width:100%; height: 100%; position:relative; display:flex; justify-content:center; align-items:center; color:#0BAB64; font-size:10pt;">
                            <el-button size="supermini" type="primary" icon="el-icon-plus" circle
                                style="position:absolute; top:-12.5px; right:-12.5px; font-size:12px;"></el-button>
                            {{language.newPage}}
                        </div>
                    </div>
                    <div v-for="(page, index) in pages" :key="index"
                        v-bind:class="{ 'active-page': index === activePage, 'page-item' : true }"
                        v-on:click="setPage(index)" v-bind:style="{background: page.fill}">
                        <div
                            style="width:100%; height: 100%; position:relative; display:flex; justify-content:center; align-items:center; font-size:10pt;">
                            <el-button v-if="index === activePage" v-on:click.prevent="removePage(index)"
                                size="supermini" type="danger" icon="el-icon-delete" circle
                                style="position:absolute; top:-12.5px; right:-12.5px; font-size:12px;">
                            </el-button>
                            {{page.width}}x{{page.height}} <br />
                            {{page.name}}
                        </div>
                    </div>
                </div>
            </div>
            <!-- images tab -->
            <div class="tab" v-if="tab === 'images' && typeof activePage === 'number' && !activeSelection">
                <el-upload drag :before-upload="uploadImageBase64" accept=".jpg,.jpeg,.png,.JPG,.JPEG,.svg,.SVG"
                    action="#">
                    <i class="el-icon-upload"></i>
                    <div class="el-upload__text">{{language.uploadText}} <br><em>{{language.uploadTextAccented}}</em>
                    </div>
                    <div class="el-upload__tip" slot="tip">{{language.uploadTextSmall}}</div>
                </el-upload>
            </div>
            <!-- shapes tab -->
            <div class="tab" v-if="tab === 'shapes' && typeof activePage === 'number' && !activeSelection">
                <el-row type="flex" justify="space-between" style="margin-bottom:20px;">
                    <el-col :span="24">
                        <el-collapse v-model="activeNames">
                            <el-collapse-item :title="language.shapesHeader" name="1">
                                <div class="shapes-container-div">
                                    <el-row type="flex" justify="space-between" style="margin-bottom:20px;">
                                        <el-col :span="6"><svg v-on:click="addCircle" xmlns="http://www.w3.org/2000/svg"
                                                width="44" height="44">
                                                <circle fill="#EDEDED" cx="22" cy="22" r="22"></circle>
                                            </svg>
                                        </el-col>
                                        <el-col :span="6"><svg v-on:click="addTriangle"
                                                xmlns="http://www.w3.org/2000/svg" width="44" height="44">
                                                <polygon fill="#EDEDED" points="0,44 22,0 44,44"></polygon>
                                            </svg>
                                        </el-col>
                                        <el-col :span="6">
                                            <svg v-on:click="addRect" xmlns="http://www.w3.org/2000/svg" width="44"
                                                height="44">
                                                <rect fill="#EDEDED" width="44" height="44"></rect>
                                            </svg>
                                        </el-col>
                                    </el-row>
                                    <el-row type="flex" justify="space-between">
                                        <el-col :span="6" v-on:click="addEllipse"><svg v-on:click="addEllipse"
                                                xmlns="http://www.w3.org/2000/svg" width="44" height="44">
                                                <ellipse fill="#EDEDED" cx="22" cy="22" ry="15" rx="22"></ellipse>
                                            </svg>
                                        </el-col>
                                    </el-row>
                                </div>
                            </el-collapse-item>
                            <el-collapse-item :title="language.clipartsHeader" name="2">
                                <div v-for="(clipart, i) in cliparts" :key="i"
                                    style="display:flex; flex-direction: row; justify-content: space-around;  flex-wrap: wrap;">
                                    <div v-for="(file, j) in clipart.files" :key="j">
                                        <el-image class="clipart-image"
                                            v-on:click="addClipart(`${hostUrl}/${file.url}`, $event)"
                                            v-on:mousedown="$event.preventDefault()" style="width: 80px; height: 80px"
                                            :src="`${hostUrl}/${file.url}`" fit="fill"></el-image>
                                    </div>
                                </div>
                            </el-collapse-item>
                        </el-collapse>
                    </el-col>
                </el-row>
            </div>
            <!-- utils tab -->
            <div class="tab" v-if="tab === 'utils' && typeof activePage === 'number' && !activeSelection">
                <el-row type="flex" justify="space-between"
                    style="margin-bottom:10px; border-bottom:1px solid #373842; align-items:center; padding-bottom:10px;">
                    <el-col :span="14" style="font-size:10pt; color:#EDEDED;">
                        {{language.ruler}}
                    </el-col>
                    <el-col :span="4">
                        <el-switch v-model="ruler" active-color="#0BAB64" inactive-color="#373842">
                        </el-switch>
                    </el-col>
                </el-row>
                <el-row type="flex" justify="space-between"
                    style="margin-bottom:10px; border-bottom:1px solid #373842; align-items:center; padding-bottom:10px;">
                    <el-col :span="14" style="font-size:10pt; color:#EDEDED;">
                        {{language.gridLines}}
                    </el-col>
                    <el-col :span="4">
                        <el-switch v-model="grid" v-on:change="setGrid" active-color="#0BAB64" inactive-color="#373842">
                        </el-switch>
                    </el-col>
                </el-row>
                <el-row type="flex" justify="space-between"
                    style="margin-bottom:10px; border-bottom:1px solid #373842; align-items:center; padding-bottom:10px;">
                    <el-col :span="10" style="font-size:10pt; color:#EDEDED;">
                        {{language.gridSize}}
                    </el-col>
                    <el-col :span="13">
                        <el-slider :value="gridSize" v-on:input="setGridSize" :min="3" :max="50" :show-tooltip="false">
                        </el-slider>
                    </el-col>
                </el-row>
            </div>
            <!-- activeSelection edit -->
            <div style="padding: 20px 20px 0px 20px; display: flex; flex-direction: column; width: calc(100% - 40px);}"
                v-if="activeSelection && typeof activePage === 'number'">

                <!-- text -->
                <div v-if="activeSelection.type === 'InteractiveText'">
                    <el-row type="flex" justify="space-between"
                        style="margin-bottom:10px; border-bottom:1px solid #373842; align-items:center; padding-bottom:10px;">
                        <el-col :span="10" style="font-size:10pt; color:#EDEDED;">
                            {{language.textFontFamily}}
                        </el-col>
                        <el-col :span="14">
                            <div>
                                <div class="font-select" v-on:click="fontsDialog = true">
                                    {{activeSelection.fontFamily}}</div>
                            </div>
                        </el-col>
                    </el-row>

                    <el-row type="flex" justify="space-between"
                        style="margin-bottom:10px; border-bottom:1px solid #373842; align-items:center; padding-bottom:10px;">
                        <el-col :span="12" style="font-size:10pt; color:#EDEDED;">
                            {{language.textFontSize}}
                        </el-col>
                        <el-col :span="9">
                            <div>
                                <el-select allow-create filterable :value="activeSelection.fontSize"
                                    v-on:change="setStyle({fontSize: $event})" placeholder="35">
                                    <el-option v-for="index in 30" :key="index" :label="index * 2" :value="index * 2">
                                    </el-option>
                                </el-select>
                            </div>
                        </el-col>
                    </el-row>
                    <el-row type="flex" justify="space-between"
                        style="margin-bottom:10px; border-bottom:1px solid #373842; align-items:center; padding-bottom:10px;">
                        <el-col :span="6" style="font-size:10pt; color:#EDEDED;">
                            {{language.textColor}}
                        </el-col>
                        <el-col :span="4">
                            <el-color-picker :value="activeSelection.fill" size="medium" style="margin-left:4px;"
                                v-on:change="setStyle({fill: $event})"></el-color-picker>
                        </el-col>
                    </el-row>
                    <el-row type="flex" justify="space-between"
                        style="margin-bottom:10px; border-bottom:1px solid #373842; align-items:center; padding-bottom:10px;">
                        <el-col :span="8" style="font-size:10pt; color:#EDEDED;">
                            {{language.textAlign}}
                        </el-col>
                        <el-col :span="13">
                            <el-button-group style="margin-left:6px">
                                <el-tooltip class="item" effect="dark" :content="language.left" placement="top">
                                    <el-button size="supermini" plain
                                        v-bind:class="{ active: activeSelection.lineAlign === 'left' }"
                                        v-on:click="setStyle({textAlign: 'left'})">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20"
                                            viewBox="0 0 24 24">
                                            <path fill="currentColor"
                                                d="M3.75 5.25h16.5a.75.75 0 1 1 0 1.5H3.75a.75.75 0 0 1 0-1.5zm0 4h8.5a.75.75 0 1 1 0 1.5h-8.5a.75.75 0 1 1 0-1.5zm0 4h16.5a.75.75 0 1 1 0 1.5H3.75a.75.75 0 1 1 0-1.5zm0 4h8.5a.75.75 0 1 1 0 1.5h-8.5a.75.75 0 1 1 0-1.5z">
                                            </path>
                                        </svg>
                                    </el-button>
                                </el-tooltip>
                                <el-tooltip class="item" effect="dark" :content="language.center" placement="top">
                                    <el-button size="supermini" plain
                                        v-bind:class="{ active: activeSelection.lineAlign === 'center' }"
                                        v-on:click="setStyle({textAlign: 'center'})">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20"
                                            viewBox="0 0 24 24">
                                            <path fill="currentColor" fill-rule="evenodd"
                                                d="M3.75 5.25h16.5a.75.75 0 1 1 0 1.5H3.75a.75.75 0 0 1 0-1.5zm4 4h8.5a.75.75 0 1 1 0 1.5h-8.5a.75.75 0 1 1 0-1.5zm-4 4h16.5a.75.75 0 1 1 0 1.5H3.75a.75.75 0 1 1 0-1.5zm4 4h8.5a.75.75 0 1 1 0 1.5h-8.5a.75.75 0 1 1 0-1.5z">
                                            </path>
                                        </svg>
                                    </el-button>
                                </el-tooltip>
                                <el-tooltip class="item" effect="dark" :content="language.right" placement="top">
                                    <el-button size="supermini" plain
                                        v-bind:class="{ active: activeSelection.lineAlign === 'right' }"
                                        v-on:click="setStyle({textAlign: 'right'})">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20"
                                            viewBox="0 0 24 24">
                                            <path fill="currentColor" fill-rule="evenodd"
                                                d="M20.25 5.25a.75.75 0 1 1 0 1.5H3.75a.75.75 0 0 1 0-1.5h16.5zm0 4a.75.75 0 1 1 0 1.5h-8.5a.75.75 0 1 1 0-1.5h8.5zm0 4a.75.75 0 1 1 0 1.5H3.75a.75.75 0 1 1 0-1.5h16.5zm0 4a.75.75 0 1 1 0 1.5h-8.5a.75.75 0 1 1 0-1.5h8.5z">
                                            </path>
                                        </svg>
                                    </el-button>
                                </el-tooltip>
                            </el-button-group>
                        </el-col>
                    </el-row>
                    <el-row type="flex" justify="space-between"
                        style="margin-bottom:10px; border-bottom:1px solid #373842; align-items:center; padding-bottom:10px;">
                        <el-col :span="8" style="font-size:10pt; color:#EDEDED;">
                            {{language.textTracking}}
                        </el-col>
                        <el-col :span="14">
                            <el-slider v-model="activeSelection.tracking" v-on:change="setStyle({tracking: $event})"
                                :min="-400" :max="400">
                            </el-slider>
                        </el-col>
                    </el-row>
                </div>
                <!-- text -->
                <!-- shape -->
                <div
                    v-if="activeSelection.type === 'triangle' || activeSelection.type === 'circle' || activeSelection.type === 'rect' || activeSelection.type === 'ellipse'">
                    <el-row type="flex" justify="space-between"
                        style="margin-bottom:10px; border-bottom:1px solid #373842; align-items:center; padding-bottom:10px;">
                        <el-col :span="12" style="font-size:10pt; color:#EDEDED;">
                            {{language.strokeWidth}}
                        </el-col>
                        <el-col :span="9">
                            <div>
                                <el-select allow-create filterable :value="activeSelection.strokeWidth"
                                    v-on:change="setStyle({strokeWidth: $event})" default-first-option>
                                    <el-option v-for="index in 30" :key="index" :label="index / 2" :value="index / 2">
                                    </el-option>
                                </el-select>
                            </div>
                        </el-col>
                    </el-row>
                    <el-row type="flex" justify="space-between"
                        style="margin-bottom:10px; border-bottom:1px solid #373842; align-items:center; padding-bottom:10px;">
                        <el-col :span="8" style="font-size:10pt; color:#EDEDED;">
                            {{language.strokeColor}}
                        </el-col>
                        <el-col :span="4">
                            <el-color-picker :value="activeSelection.stroke" size="medium" style="margin-left:4px;"
                                v-on:change="setStyle({stroke: $event})"></el-color-picker>
                        </el-col>
                    </el-row>
                    <el-row type="flex" justify="space-between"
                        style="margin-bottom:10px; border-bottom:1px solid #373842; align-items:center; padding-bottom:10px;">
                        <el-col :span="6" style="font-size:10pt; color:#EDEDED;">
                            {{language.fillColor}}
                        </el-col>
                        <el-col :span="4">
                            <el-color-picker :value="activeSelection.fill" size="medium" style="margin-left:4px;"
                                v-on:change="setStyle({fill: $event})"></el-color-picker>
                        </el-col>
                    </el-row>
                </div>
                <!-- shape -->
                <el-row type="flex" justify="space-between"
                    style="margin-bottom:10px; border-bottom:1px solid #373842; align-items:center; padding-bottom:10px;">
                    <el-col :span="8" style="font-size:10pt; color:#EDEDED;">
                        {{language.align}}
                    </el-col>
                    <el-col :span="13">
                        <el-button-group style="margin-bottom:10px; margin-left:6px">
                            <el-tooltip class="item" effect="dark" :content="language.left" placement="top">
                                <el-button size="supermini" plain v-on:click="setAlign('left')">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24">
                                        <path fill="currentColor"
                                            d="M4 3c.41 0 .75.34.75.75v16.5a.75.75 0 1 1-1.5 0V3.75c0-.41.34-.75.75-.75zm5 3h9a2 2 0 0 1 2 2v1a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2V8c0-1.1.9-2 2-2zm0 7h4a2 2 0 0 1 2 2v1a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2v-1c0-1.1.9-2 2-2zm0-5.5a.5.5 0 0 0-.5.5v1c0 .28.22.5.5.5h9a.5.5 0 0 0 .5-.5V8a.5.5 0 0 0-.5-.5H9zm0 7a.5.5 0 0 0-.5.5v1c0 .28.22.5.5.5h4a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 0-.5-.5H9z">
                                        </path>
                                    </svg>
                                </el-button>
                            </el-tooltip>
                            <el-tooltip class="item" effect="dark" :content="language.center" placement="top">
                                <el-button size="supermini" plain v-on:click="setAlign('center')">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24">
                                        <path fill="currentColor"
                                            d="M11.25 13v-2H7a2 2 0 0 1-2-2V8c0-1.1.9-2 2-2h4.25V3.75a.75.75 0 1 1 1.5 0V6H17a2 2 0 0 1 2 2v1a2 2 0 0 1-2 2h-4.25v2H14a2 2 0 0 1 2 2v1a2 2 0 0 1-2 2h-1.25v2.25a.75.75 0 1 1-1.5 0V18H10a2 2 0 0 1-2-2v-1c0-1.1.9-2 2-2h1.25zM7 7.5a.5.5 0 0 0-.5.5v1c0 .28.22.5.5.5h10a.5.5 0 0 0 .5-.5V8a.5.5 0 0 0-.5-.5H7zm3 7a.5.5 0 0 0-.5.5v1c0 .28.22.5.5.5h4a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 0-.5-.5h-4z">
                                        </path>
                                    </svg>
                                </el-button>
                            </el-tooltip>
                            <el-tooltip class="item" effect="dark" :content="language.right" placement="top">
                                <el-button size="supermini" plain v-on:click="setAlign('right')">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24">
                                        <path fill="currentColor"
                                            d="M20 3a.75.75 0 0 0-.75.75v16.5a.75.75 0 1 0 1.5 0V3.75A.75.75 0 0 0 20 3zm-5 3H6a2 2 0 0 0-2 2v1c0 1.1.9 2 2 2h9a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2zm0 7h-4a2 2 0 0 0-2 2v1c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2v-1a2 2 0 0 0-2-2zm0-5.5c.28 0 .5.22.5.5v1a.5.5 0 0 1-.5.5H6a.5.5 0 0 1-.5-.5V8c0-.28.22-.5.5-.5h9zm0 7c.28 0 .5.22.5.5v1a.5.5 0 0 1-.5.5h-4a.5.5 0 0 1-.5-.5v-1c0-.28.22-.5.5-.5h4z">
                                        </path>
                                    </svg>
                                </el-button>
                            </el-tooltip>
                        </el-button-group>
                        <el-button-group style="margin-left:6px">
                            <el-tooltip class="item" effect="dark" :content="language.top" placement="top">
                                <el-button size="supermini" plain v-on:click="setAlign('top')">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24">
                                        <path fill="currentColor"
                                            d="M21 4c0 .41-.34.75-.75.75H3.75a.75.75 0 0 1 0-1.5h16.5c.41 0 .75.34.75.75zM11 9v9a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V9c0-1.1.9-2 2-2h1a2 2 0 0 1 2 2zm7 0v4a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2V9c0-1.1.9-2 2-2h1a2 2 0 0 1 2 2zM9.5 9a.5.5 0 0 0-.5-.5H8a.5.5 0 0 0-.5.5v9c0 .28.22.5.5.5h1a.5.5 0 0 0 .5-.5V9zm7 0a.5.5 0 0 0-.5-.5h-1a.5.5 0 0 0-.5.5v4c0 .28.22.5.5.5h1a.5.5 0 0 0 .5-.5V9z">
                                        </path>
                                    </svg> </el-button>
                            </el-tooltip>
                            <el-tooltip class="item" effect="dark" :content="language.middle" placement="top">
                                <el-button size="supermini" plain v-on:click="setAlign('middle')">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24">
                                        <path fill="currentColor"
                                            d="M11 11.25h2V7c0-1.1.9-2 2-2h1a2 2 0 0 1 2 2v4.25h2.25a.75.75 0 1 1 0 1.5H18V17a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-4.25h-2V14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2v-1.25H3.75a.75.75 0 1 1 0-1.5H6V10c0-1.1.9-2 2-2h1a2 2 0 0 1 2 2v1.25zM16.5 7a.5.5 0 0 0-.5-.5h-1a.5.5 0 0 0-.5.5v10c0 .28.22.5.5.5h1a.5.5 0 0 0 .5-.5V7zm-7 3a.5.5 0 0 0-.5-.5H8a.5.5 0 0 0-.5.5v4c0 .28.22.5.5.5h1a.5.5 0 0 0 .5-.5v-4z">
                                        </path>
                                    </svg> </el-button>
                            </el-tooltip>
                            <el-tooltip class="item" effect="dark" :content="language.bottom" placement="top">
                                <el-button size="supermini" plain v-on:click="setAlign('bottom')">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24">
                                        <path fill="currentColor"
                                            d="M21 20c0 .41-.34.75-.75.75H3.75a.75.75 0 1 1 0-1.5h16.5c.41 0 .75.34.75.75zM11 6v9a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V6c0-1.1.9-2 2-2h1a2 2 0 0 1 2 2zm7 5v4a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-4c0-1.1.9-2 2-2h1a2 2 0 0 1 2 2zM9.5 6a.5.5 0 0 0-.5-.5H8a.5.5 0 0 0-.5.5v9c0 .28.22.5.5.5h1a.5.5 0 0 0 .5-.5V6zm7 5a.5.5 0 0 0-.5-.5h-1a.5.5 0 0 0-.5.5v4c0 .28.22.5.5.5h1a.5.5 0 0 0 .5-.5v-4z">
                                        </path>
                                    </svg> </el-button>
                            </el-tooltip>
                        </el-button-group>
                    </el-col>
                </el-row>
                <el-row type="flex" justify="space-between"
                    style="margin-bottom:10px; border-bottom:1px solid #373842; align-items:center; padding-bottom:10px;">
                    <el-col :span="6" style="font-size:10pt; color:#EDEDED;">
                        {{language.layering}}
                    </el-col>
                    <el-col :span="17">
                        <el-button-group style="margin-left:4px;">
                            <el-tooltip class="item" effect="dark" :content="language.front" placement="top">
                                <el-button size="supermini" plain v-on:click="setLayer('front')">
                                    <svg viewBox="0 0 12 16" width="14" height="14">
                                        <path fill="currentColor"
                                            d="M1.60126 6.87504L6.0444 2.28786L10.3988 6.78264C10.5606 6.94973 10.829 6.94913 10.9901 6.78131L11.8857 5.84851C12.0385 5.6893 12.038 5.4378 11.8846 5.27919L6.95817 0.187666C6.84211 0.0677257 6.68231 -4.64887e-07 6.51536 -4.79483e-07L5.57347 -5.61825e-07C5.4065 -5.76422e-07 5.24669 0.067736 5.13063 0.187694L0.115409 5.37164C-0.0380459 5.53026 -0.0385266 5.78174 0.114322 5.94094L1.00989 6.87374C1.17102 7.04157 1.43939 7.04216 1.60126 6.87504Z">
                                        </path>
                                        <path fill="currentColor"
                                            d="M1.60125 12.8752L4.99993 9.36631L4.99993 15.6001C4.99993 15.821 5.17902 16.0001 5.39993 16.0001L6.59993 16.0001C6.82084 16.0001 6.99993 15.821 6.99993 15.6001L6.99993 9.27432L10.3988 12.7828C10.5606 12.9499 10.829 12.9493 10.9901 12.7814L11.8857 11.8486C12.0385 11.6894 12.038 11.4379 11.8846 11.2793L6.95817 6.18779C6.84211 6.06785 6.68231 6.00012 6.51536 6.00012L5.57347 6.00012C5.4065 6.00012 5.24669 6.06786 5.13063 6.18782L0.115409 11.3718C-0.0380455 11.5304 -0.0385271 11.7819 0.114321 11.9411L1.00989 12.8739C1.17102 13.0417 1.43938 13.0423 1.60125 12.8752Z">
                                        </path>
                                    </svg>
                                </el-button>
                            </el-tooltip>
                            <el-tooltip class="item" effect="dark" :content="language.forward" placement="top">
                                <el-button size="supermini" plain v-on:click="setLayer('up')">
                                    <svg viewBox="0 0 16 16" width="14" height="14">
                                        <path fill="currentColor"
                                            d="M8.99287 10.4938C8.99287 10.77 8.76901 10.9938 8.49287 10.9938H7.49287C7.21673 10.9938 6.99287 10.77 6.99287 10.4938V4.99384H4.99287C4.79283 4.99103 4.61372 4.86925 4.53755 4.68426C4.46138 4.49927 4.50281 4.28669 4.64287 4.14384L7.64287 1.14384C7.84068 0.952054 8.15505 0.952054 8.35287 1.14384L11.3529 4.14384C11.4942 4.28799 11.5349 4.50297 11.4562 4.68884C11.3775 4.87472 11.1947 4.99502 10.9929 4.99384H8.99287V10.4938Z">
                                        </path>
                                        <path fill="currentColor"
                                            d="M3.77352 10.8208L5.49291 9.74613V7.38764L1.35672 9.97276C0.730051 10.3644 0.730052 11.2771 1.35672 11.6688L7.46992 15.4895C7.7942 15.6922 8.20565 15.6922 8.52992 15.4895L14.6431 11.6688C15.2698 11.2771 15.2698 10.3644 14.6431 9.97275L10.4929 7.37887V9.73736L12.2263 10.8208L7.99992 13.4623L3.77352 10.8208Z">
                                        </path>
                                    </svg>
                                </el-button>
                            </el-tooltip>
                            <el-tooltip class="item" effect="dark" :content="language.backward" placement="top">
                                <el-button size="supermini" plain v-on:click="setLayer('down')">
                                    <svg viewBox="0 0 16 16" width="14" height="14">
                                        <path fill="currentColor"
                                            d="M7.00698 6.14767C7.00698 5.87153 7.23083 5.64767 7.50698 5.64767H8.50698C8.78312 5.64767 9.00698 5.87153 9.00698 6.14767L9.00698 11.6477H11.007C11.207 11.6505 11.3861 11.7723 11.4623 11.9572C11.5385 12.1422 11.497 12.3548 11.357 12.4977L8.35698 15.4977C8.15916 15.6895 7.84479 15.6895 7.64698 15.4977L4.64698 12.4977C4.50567 12.3535 4.46491 12.1385 4.54363 11.9527C4.62236 11.7668 4.80512 11.6465 5.00698 11.6477H7.00698L7.00698 6.14767Z">
                                        </path>
                                        <path fill="currentColor"
                                            d="M12.2263 5.82075L10.5069 6.89537V9.25387L14.6431 6.66875C15.2698 6.27708 15.2698 5.36442 14.6431 4.97275L8.52992 1.152C8.20565 0.949333 7.79419 0.949333 7.46992 1.152L1.35672 4.97275C0.730051 5.36442 0.730052 6.27708 1.35672 6.66875L5.50694 9.26264V6.90414L3.77352 5.82075L7.99992 3.17925L12.2263 5.82075Z">
                                        </path>
                                    </svg>
                                </el-button>
                            </el-tooltip>
                            <el-tooltip class="item" effect="dark" :content="language.back" placement="top">
                                <el-button size="supermini" plain v-on:click="setLayer('back')">
                                    <svg viewBox="0 0 12 16" width="14" height="14">
                                        <path fill="currentColor"
                                            d="M10.3987 9.12508L5.9556 13.7123L1.60124 9.21748C1.43936 9.05039 1.17102 9.05099 1.0099 9.21881L0.114321 10.1516C-0.0385337 10.3108 -0.0380454 10.5623 0.115427 10.7209L5.04183 15.8125C5.15789 15.9324 5.31769 16.0001 5.48464 16.0001H6.42653C6.5935 16.0001 6.75331 15.9324 6.86937 15.8124L11.8846 10.6285C12.038 10.4699 12.0385 10.2184 11.8857 10.0592L10.9901 9.12638C10.829 8.95855 10.5606 8.95796 10.3987 9.12508Z">
                                        </path>
                                        <path fill="currentColor"
                                            d="M10.3987 3.12495L7.00007 6.63381V0.4C7.00007 0.179086 6.82098 -1.93129e-08 6.60007 0L5.40007 1.04907e-07C5.17916 1.2422e-07 5.00007 0.179086 5.00007 0.4V6.7258L1.60124 3.21736C1.43936 3.05027 1.17102 3.05087 1.0099 3.21869L0.114321 4.15149C-0.0385342 4.3107 -0.0380459 4.5622 0.115426 4.72081L5.04183 9.81233C5.15789 9.93227 5.31769 10 5.48464 10H6.42653C6.5935 10 6.75331 9.93226 6.86937 9.81231L11.8846 4.62835C12.038 4.46974 12.0385 4.21826 11.8857 4.05905L10.9901 3.12626C10.829 2.95843 10.5606 2.95784 10.3987 3.12495Z">
                                        </path>
                                    </svg>
                                </el-button>
                            </el-tooltip>
                        </el-button-group>
                    </el-col>
                </el-row>
                <el-row type="flex"
                    style="margin-bottom:10px; border-bottom:1px solid #373842; align-items:center; padding-bottom:10px;">
                    <el-col :span="24" style="display:flex; justify-content:flex-end;">
                        <el-button-group>
                            <el-button v-on:click="groupSelection" style="width:auto;" plain size="supermini"
                                v-if="activeSelection.type === 'activeSelection' || activeSelection.type === 'group'">
                                {{activeSelection.type === 'activeSelection' ? language.group : activeSelection.type === 'group' ? language.ungroup : ''}}
                            </el-button>
                            <el-tooltip class="item" effect="dark" :content="language.duplicate" placement="top">
                                <el-button size="supermini" plain icon="el-icon-copy-document"
                                    v-on:click="cloneSelection">
                                </el-button>
                            </el-tooltip>
                            <el-tooltip class="item" effect="dark" :content="language.delete" placement="top">
                                <el-button size="supermini" icon="el-icon-delete" plain v-on:click="deleteSelection">
                                </el-button>
                            </el-tooltip>
                        </el-button-group>
                    </el-col>
                </el-row>
            </div>
            <!-- activeSelection edit -->
        </div>
        <!-- export -->
        <div class="export">
            <el-button plain v-on:click="closeEditor">{{language.cancelBtn}}</el-button>
            <el-button plain v-on:click="previewEditor">{{language.previewBtn}}</el-button>
            <el-button type="primary" v-on:click="exportDrawing">{{language.saveBtn}}</el-button>
        </div>
        <!-- pages -->
        <div class="pages-menu" v-if="pages.length > 1">
            <el-button :plain="index !== activePage" v-for="(page, index) in pages" :key="index"
                :type="index === activePage ? 'primary' : ''" v-on:click="setPage(index)">
                {{page.name || index}}
            </el-button>
        </div>

        <!-- zoom -->
        <div class="zoom">
            <div style="height: 40px; color: #C0C4CC; width: 40vw; min-width: 260px;">
                <el-row type="flex" justify="space-between">
                    <el-col :span="2" style="display:flex; align-items:center; justify-content:center;">
                        <el-tooltip class="item" effect="dark" :content="language.gridLines" placement="top">
                            <el-button plain icon="el-icon-s-grid" circle size="supermini"
                                v-on:click="grid = !grid; setGrid()">
                            </el-button>
                        </el-tooltip>
                    </el-col>
                    <el-col :span="2" style="display:flex; align-items:center; justify-content:center;">
                        <el-tooltip class="item" effect="dark" :content="language.centerPage" placement="top">
                            <el-button plain icon="el-icon-full-screen" circle size="supermini" v-on:click="zoomToFit">
                            </el-button>
                        </el-tooltip>
                    </el-col>
                    <el-col :span="2" style="display:flex; align-items:center; justify-content:center;">
                        <el-tooltip class="item" effect="dark" :content="language.zoomOut" placement="top">
                            <el-button plain icon="el-icon-minus" circle size="supermini" v-on:click="zoomOut">
                            </el-button>
                        </el-tooltip>
                    </el-col>
                    <el-col :span="14" style="display:flex; align-items:center; justify-content:center;">
                        <el-slider :value="zoom" v-on:input="sliderZoom" :min="25" :max="250" :show-tooltip="false"
                            style="width:100%;">
                        </el-slider>
                    </el-col>
                    <el-col :span="2" style="display:flex; align-items:center; justify-content:center;">
                        <el-tooltip class="item" effect="dark" :content="language.zoomIn" placement="top">
                            <el-button plain icon="el-icon-plus" circle size="supermini" v-on:click="zoomIn">
                            </el-button>
                        </el-tooltip>
                    </el-col>
                    <el-col :span="2"
                        style="display:flex; align-items:center; justify-content:center; font-size:11pt; user-select:none;">
                        {{zoom}}%
                    </el-col>
                </el-row>
            </div>
        </div>
        <!-- container -->
        <div class="container">
            <div class="menu">
                <el-tooltip class="item" effect="dark" :content="language.pages" placement="right">
                    <div v-on:click="navMenu('pages')" v-bind:class="{ active: tab === 'pages' }">
                        <!-- svg icon -->
                        <svg viewBox="0 0 24 24">
                            <path fill="currentColor" fill-rule="evenodd"
                                d="M3 2C2.44772 2 2 2.44772 2 3V8C2 8.55228 2.44772 9 3 9H9C9.55228 9 10 8.55228 10 8V3C10 2.44772 9.55228 2 9 2H3ZM8 4H4V7H8V4Z">
                            </path>
                            <path fill="currentColor" fill-rule="evenodd"
                                d="M3 11C2.44772 11 2 11.4477 2 12V21C2 21.5523 2.44772 22 3 22H9C9.55228 22 10 21.5523 10 21V12C10 11.4477 9.55228 11 9 11H3ZM8 13H4V20H8V13Z">
                            </path>
                            <path fill="currentColor" fill-rule="evenodd"
                                d="M13 15C12.4477 15 12 15.4477 12 16V21C12 21.5523 12.4477 22 13 22H21C21.5523 22 22 21.5523 22 21V16C22 15.4477 21.5523 15 21 15H13ZM20 17H14V20H20V17Z">
                            </path>
                            <path fill="currentColor" fill-rule="evenodd"
                                d="M13 2C12.4477 2 12 2.44771 12 3V12C12 12.5523 12.4477 13 13 13H21C21.5523 13 22 12.5523 22 12V3C22 2.44772 21.5523 2 21 2H13ZM20 4H14V11H20V4Z">
                            </path>
                        </svg>

                        <!-- svg icon -->
                    </div>
                </el-tooltip>
                <el-tooltip class="item" effect="dark" :content="language.text" placement="right">
                    <div v-on:click="navMenu('text')" v-bind:class="{ active: tab === 'text' }">
                        <!-- svg icon -->
                        <svg viewBox="0 0 24 24">
                            <path fill="currentColor" d="M16 8V10H13V16H11V10H8V8H16Z"></path>
                            <path fill="currentColor" fill-rule="evenodd"
                                d="M0 1C0 0.447715 0.447715 0 1 0H5C5.55228 0 6 0.447715 6 1V2H18V1C18 0.447715 18.4477 0 19 0H23C23.5523 0 24 0.447715 24 1V5C24 5.55228 23.5523 6 23 6H22V18H23C23.5523 18 24 18.4477 24 19V23C24 23.5523 23.5523 24 23 24H19C18.4477 24 18 23.5523 18 23V22H6V23C6 23.5523 5.55228 24 5 24H1C0.447715 24 0 23.5523 0 23V19C0 18.4477 0.447715 18 1 18H2V6H1C0.447715 6 0 5.55228 0 5V1ZM20 20V22H22V20H20ZM18 20H6V19C6 18.4477 5.55228 18 5 18H4V6H5C5.55228 6 6 5.55228 6 5V4H18V5C18 5.55228 18.4477 6 19 6H20V18H19C18.4477 18 18 18.4477 18 19V20ZM2 20H4V22H2V20ZM2 4H4V2H2V4ZM20 4V2H22V4H20Z">
                            </path>
                        </svg>
                        <!-- svg icon -->
                    </div>
                </el-tooltip>
                <el-tooltip class="item" effect="dark" :content="language.images" placement="right">
                    <div v-on:click="navMenu('images')" v-bind:class="{ active: tab === 'images' }">
                        <!-- svg icon -->
                        <svg viewBox="0 0 24 24">
                            <path fill="currentColor"
                                d="M9 11C10.1046 11 11 10.1046 11 9C11 7.89543 10.1046 7 9 7C7.89543 7 7 7.89543 7 9C7 10.1046 7.89543 11 9 11Z">
                            </path>
                            <path fill="currentColor" fill-rule="evenodd"
                                d="M4.22222 2H19.7778C21.0051 2 22 2.99492 22 4.22222V19.7778C22 21.0051 21.0051 22 19.7778 22H4.22222C2.99492 22 2 21.0051 2 19.7778V4.22222C2 2.99492 2.99492 2 4.22222 2ZM19.7778 4H4.22222C4.09949 4 4 4.09949 4 4.22222V18.4136L6.94363 15.8379C7.54687 15.3101 8.4476 15.3101 9.05084 15.8379L9.41854 16.1597C10.04 16.7034 10.9731 16.685 11.5725 16.1171L14.3999 13.4385C15.0171 12.8538 15.9836 12.8538 16.6007 13.4385L20 16.6588V4.22222C20 4.09949 19.9005 4 19.7778 4Z">
                            </path>
                        </svg>
                        <!-- svg icon -->
                    </div>
                </el-tooltip>
                <el-tooltip class="item" effect="dark" :content="language.shapes" placement="right">
                    <div v-on:click="navMenu('shapes')" v-bind:class="{ active: tab === 'shapes' }">
                        <!-- svg icon -->
                        <svg viewBox="0 0 24 24">
                            <path fill="currentColor" fill-rule="evenodd"
                                d="M14.9291 7C14.4439 3.60771 11.5265 1 8 1C4.13401 1 1 4.13401 1 8C1 11.5265 3.60771 14.4439 7 14.9291V21C7 22.1046 7.89543 23 9 23H21C22.1046 23 23 22.1046 23 21V9C23 7.89543 22.1046 7 21 7H14.9291ZM9 14.9291V21H21V9H14.9291C14.4906 12.0657 12.0657 14.4906 9 14.9291ZM12.9468 7.96889C12.9468 10.718 10.7181 12.9467 7.96899 12.9467C5.21984 12.9467 2.99121 10.718 2.99121 7.96889C2.99121 5.21974 5.21984 2.99111 7.96899 2.99111C10.7181 2.99111 12.9468 5.21974 12.9468 7.96889Z">
                            </path>
                        </svg>
                        <!-- svg icon -->
                    </div>
                </el-tooltip>
                <el-tooltip class="item" effect="dark" :content="language.utils" placement="right">
                    <div v-on:click="navMenu('utils')" v-bind:class="{ active: tab === 'utils' }">
                        <!-- svg icon -->
                        <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"
                            xml:space="preserve">
                            <path fill="currentColor" d="M490.667,405.333h-56.811C424.619,374.592,396.373,352,362.667,352s-61.931,22.592-71.189,53.333H21.333
		C9.557,405.333,0,414.891,0,426.667S9.557,448,21.333,448h270.144c9.237,30.741,37.483,53.333,71.189,53.333
		s61.931-22.592,71.189-53.333h56.811c11.797,0,21.333-9.557,21.333-21.333S502.464,405.333,490.667,405.333z M362.667,458.667
		c-17.643,0-32-14.357-32-32s14.357-32,32-32s32,14.357,32,32S380.309,458.667,362.667,458.667z" />
                            <path fill="currentColor"
                                d="M490.667,64h-56.811c-9.259-30.741-37.483-53.333-71.189-53.333S300.736,33.259,291.477,64H21.333
		C9.557,64,0,73.557,0,85.333s9.557,21.333,21.333,21.333h270.144C300.736,137.408,328.96,160,362.667,160
		s61.931-22.592,71.189-53.333h56.811c11.797,0,21.333-9.557,21.333-21.333S502.464,64,490.667,64z M362.667,117.333
		c-17.643,0-32-14.357-32-32c0-17.643,14.357-32,32-32s32,14.357,32,32C394.667,102.976,380.309,117.333,362.667,117.333z" />
                            <path fill="currentColor" d="M490.667,234.667H220.523c-9.259-30.741-37.483-53.333-71.189-53.333s-61.931,22.592-71.189,53.333H21.333
		C9.557,234.667,0,244.224,0,256c0,11.776,9.557,21.333,21.333,21.333h56.811c9.259,30.741,37.483,53.333,71.189,53.333
		s61.931-22.592,71.189-53.333h270.144c11.797,0,21.333-9.557,21.333-21.333C512,244.224,502.464,234.667,490.667,234.667z
		M149.333,288c-17.643,0-32-14.357-32-32s14.357-32,32-32c17.643,0,32,14.357,32,32S166.976,288,149.333,288z" />
                        </svg>
                        <!-- svg icon -->
                    </div>
                </el-tooltip>
                <el-tooltip class="item" effect="dark" :content="language.undo" placement="right">
                    <div v-on:click="undo">
                        <!-- svg icon -->
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                            <path fill="currentColor"
                                d="M6.05 7.25l2.22-2.22A.75.75 0 0 0 7.2 3.97L4.43 6.75c-.69.68-.69 1.8 0 2.48l2.83 2.83A.75.75 0 0 0 8.32 11L6.07 8.75H16a4.25 4.25 0 1 1 0 8.5h-4a.75.75 0 1 0 0 1.5h4a5.75 5.75 0 0 0 0-11.5H6.05z">
                            </path>
                        </svg>
                        <!-- svg icon -->
                    </div>
                </el-tooltip>
                <el-tooltip class="item" effect="dark" :content="language.redo" placement="right">
                    <div v-on:click="redo">
                        <!-- svg icon -->
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                            <path fill="currentColor"
                                d="M18.05 16.75H8a5.75 5.75 0 0 1 0-11.5h4a.75.75 0 1 1 0 1.5H8a4.25 4.25 0 1 0 0 8.5h9.97l-2.21-2.22a.75.75 0 0 1 1.06-1.06l2.83 2.83c.68.68.68 1.8 0 2.48l-2.83 2.82a.75.75 0 1 1-1.06-1.06l2.3-2.3z">
                            </path>
                        </svg>
                        <!-- svg icon -->
                    </div>
                </el-tooltip>
                <el-tooltip class="item" effect="dark" :content="language.help" placement="right">
                    <div v-on:click="helpEditor">
                        <!-- svg icon -->
                        <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"
                            xml:space="preserve">
                            <circle fill="currentColor" cx="256" cy="378.5" r="25" />
                            <path fill="currentColor" d="M256,0C114.516,0,0,114.497,0,256c0,141.484,114.497,256,256,256c141.484,0,256-114.497,256-256
C512,114.516,397.503,0,256,0z M256,472c-119.377,0-216-96.607-216-216c0-119.377,96.607-216,216-216
c119.377,0,216,96.607,216,216C472,375.377,375.393,472,256,472z" />
                            <path fill="currentColor" d="M256,128.5c-44.112,0-80,35.888-80,80c0,11.046,8.954,20,20,20s20-8.954,20-20c0-22.056,17.944-40,40-40
c22.056,0,40,17.944,40,40c0,22.056-17.944,40-40,40c-11.046,0-20,8.954-20,20v50c0,11.046,8.954,20,20,20
c11.046,0,20-8.954,20-20v-32.531c34.466-8.903,60-40.26,60-77.469C336,164.388,300.112,128.5,256,128.5z" />
                        </svg>
                        <!-- svg icon -->
                    </div>
                </el-tooltip>
            </div>
            <div class="canvas-wrapper">
                <canvas id="canvas"></canvas>
            </div>
        </div>
        <!-- ruler -->
        <div v-if="ruler"
            style="z-index:100; width: calc(100% - 50px); height:auto; padding:0px; position:absolute; top:0px; left: 50px;">
            <svg width='100%' height='20px' xmlns="http://www.w3.org/2000/svg">
                <g stroke='#eee' fill='#333' stroke-width='0'
                    style='font-size: 10px; font-family: lato; font-weight: 100;'>
                    <rect width='100%' height='18' stroke-width='0' />
                    <rect :x="rulerOptions.x || 0" :width="rulerOptions.w || 0" height='18' fill='#555'
                        stroke-width='0' />
                    <path :d="rulerOptions.pathDataX" stroke-width='1' />
                    <g fill='#eee'>
                        <text v-for="(text, index) in rulerOptions.textX" :key="index" :x="text.x"
                            y="14">{{text.content}}</text>
                    </g>
                </g>
            </svg>
        </div>
        <div v-if="ruler" style="z-index:99; width: auto; height:100%; position:absolute; top:0px; left: 50px;">
            <svg width='20px' height='100%' xmlns="http://www.w3.org/2000/svg">
                <g stroke='#eee' fill='#333' stroke-width='0'
                    style='font-size: 10px; font-family: lato; font-weight: 100;'>
                    <rect width='18' height='100%' stroke-width='0' />
                    <rect :y="rulerOptions.y || 0" :height="rulerOptions.h || 0" width="18" fill='#555'
                        stroke-width='0' />
                    <path :d="rulerOptions.pathDataY" stroke-width='1' />
                    <g fill='#eee'>
                        <text v-for="(text, index) in rulerOptions.textY" :key="index" :y="text.y"
                            style="writing-mode: tb; glyph-orientation-vertical: 90;" x="11">{{text.content}}</text>
                    </g>
                </g>
            </svg>
        </div>
        <!-- ruler units -->
        <div class="ruler-units">{{this.rulerOptions.units}}</div>
        <!-- object status -->
        <div class="object-status">{{this.objectStatus}}</div>
        <!-- logo -->
        <div class="editor-logo"><img draggable="false" :src="logo" /></div>
        <!-- page dialog -->
        <el-dialog :title="language.dialogPageHeader" :visible.sync="pageDialog" :close-on-click-modal="false"
            width="320px">
            <el-form :model="pageForm">
                <el-form-item :label="language.dialogPageWidth">
                    <el-input v-model="pageForm.width" autocomplete="off"></el-input>
                </el-form-item>
                <el-form-item :label="language.dialogPageHeight">
                    <el-input v-model="pageForm.height" autocomplete="off"></el-input>
                </el-form-item>
                <el-form-item :label="language.dialogPageName">
                    <el-input v-model="pageForm.name" autocomplete="off"></el-input>
                </el-form-item>
                <el-form-item :label="language.dialogPageFill">
                    <el-color-picker :value="pageForm.fill" v-on:change="setPageFill($event)" style="width:100%;">
                    </el-color-picker>
                </el-form-item>
                <!--
                <el-form-item label="Upload svg">
                    <input type="file" v-on:change="pageForm.svg = $event" style="width:100%;" />
                </el-form-item>
                -->
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button plain @click="pageDialog = false">{{language.dialogPageCancel}}</el-button>
                <el-button type="primary" @click="addPage(pageForm); pageDialog = false">{{language.dialogPageConfirm}}
                </el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script>
    import fabric from '../canvas-modules/Fabric'
    export default {
        name: 'Editor',
        props: {
            json: String
        },
        data() {
            return {
                hostUrl: 'http://localhost:3000',
                language: {
                    cancelBtn: 'Cancel',
                    previewBtn: 'Preview',
                    saveBtn: 'Save',
                    newPage: 'New',
                    dialogPageHeader: 'Page Options',
                    dialogPageWidth: 'Width',
                    dialogPageHeight: 'Height',
                    dialogPageName: 'Name',
                    dialogPageFill: 'Fill',
                    dialogPageCancel: 'Cancel',
                    dialogPageConfirm: 'Confirm',
                    addHeadingText: 'Add heading text',
                    addSubheadingText: 'Add subheading text',
                    addBodyText: 'Add body text',
                    textFontFamily: 'Font Family',
                    textFontSize: 'Font Size',
                    textColor: 'Color',
                    textAlign: 'Text Align',
                    textTracking: 'Tracking',
                    align: 'Align',
                    layering: 'Layering',
                    group: 'Group',
                    ungroup: 'Ungroup',
                    strokeWidth: 'Stroke Width',
                    strokeColor: 'Stroke Color',
                    fillColor: 'Fill Color',
                    shapesHeader: 'Shapes',
                    clipartsHeader: 'Cliparts',
                    gridLines: 'Grid Lines',
                    gridSize: 'Grid Size',
                    ruler: 'Ruler',
                    pages: 'Pages',
                    text: 'Text',
                    images: 'Images',
                    shapes: 'Shapes',
                    utils: 'Utils',
                    undo: 'Undo',
                    redo: 'Redo',
                    help: 'Help',
                    centerPage: 'Center page',
                    zoomOut: 'Zoom Out',
                    zoomIn: 'Zoom In',
                    left: 'Left',
                    center: 'Center',
                    right: 'Right',
                    middle: 'Middle',
                    top: 'Top',
                    bottom: 'Bottom',
                    front: 'Front',
                    forward: 'Forward',
                    backward: 'Backward',
                    back: 'Back',
                    duplicate: 'Duplicate',
                    delete: 'Delete',
                    uploadText: 'Drop file here or',
                    uploadTextAccented: 'click to upload',
                    uploadTextSmall: 'jpg/png/svg files with a size less than 3mb'
                },
                canvas: null,
                activeSelection: null,
                isUpperCase: false,
                zoom: 100,
                activeNames: ['1'],
                cliparts: [],
                fonts: [],
                options1: [{
                        value: 10,
                        label: '10pt'
                    },
                    {
                        value: 20,
                        label: '20pt'
                    },
                    {
                        value: 30,
                        label: '30pt'
                    },
                    {
                        value: 40,
                        label: '40pt'
                    },
                    {
                        value: 50,
                        label: '50pt'
                    },
                    {
                        value: 60,
                        label: '60pt'
                    },
                ],
                value: '',
                // experimental
                tab: null,
                loading: true,
                color: 'rgba(255, 69, 0, 0.68)',
                predefineColors: [
                    '#ff4500',
                    '#ff8c00',
                    '#ffd700',
                    '#90ee90',
                    '#00ced1',
                    '#1e90ff',
                    '#c71585',
                    'rgba(255, 69, 0, 0.68)',
                    'rgb(255, 120, 0)',
                    'hsv(51, 100, 98)',
                    'hsva(120, 40, 94, 0.5)',
                    'hsl(181, 100%, 37%)',
                    'hsla(209, 100%, 56%, 0.73)',
                    '#c7158577'
                ],
                pages: [],
                activePage: null,
                grid: false,
                gridSize: 15,
                ruler: true,
                rulerOptions: {
                    pxPerCm: 5,
                    units: '',
                    x: 0,
                    y: 0,
                    width: 0,
                    height: 0,
                    pathDataX: '',
                    pathDataY: '',
                    textX: [],
                    textY: []
                },
                pageDialog: false,
                fontsDialog: false,
                pageForm: {
                    width: 595,
                    height: 842,
                    fill: '#ffffff',
                    name: '',
                    svg: null
                },
                objectStatus: '',
                logo: ''
            }
        },
        methods: {
            addPage: function (options) {
                this.canvas.addPage(options, (page) => {
                    this.pages.push(page)
                    if (!this.activePage) {
                        this.setPage(0)
                    }
                })
            },
            removePage: function (index) {
                this.pages.splice(index, 1)
                this.activePage = null
                this.setPage(index - 1)
            },
            setPageFill: function (event) {
                if (event !== null) {
                    this.pageForm.fill = event
                }
            },
            setPage: function (index) {
                if (typeof this.activePage === 'number' && this.pages[this.activePage]) {
                    this.pages[this.activePage].json = this.canvas.toJSON(['evented', 'role',
                        'selectable'
                    ])
                }
                let page = index > -1 ? this.pages[index] : this.pages[0]
                this.canvas.clear()
                if (!page) return
                // ensure that width && height && fill match
                if (Array.isArray((page.json || {}).objects)) {
                    let foundPage = false
                    page.json.objects.forEach(object => {
                        if (object.role === 'page') {
                            foundPage = true
                            // handle rect case
                            if (object.type === 'rect') {
                                object.width = Number(page.width)
                                object.height = Number(page.height)
                                object.fill = page.fill
                            }
                        }
                    })
                    if (!foundPage) {
                        this.canvas._createObjectPage(page, (pageObject) => {
                            page.json.objects.unshift(pageObject)
                            this.canvas.loadPage(JSON.stringify(page.json), () => {
                                this.activePage = index
                            })
                        })
                    } else {
                        this.canvas.loadPage(JSON.stringify(page.json), () => {
                            this.activePage = index
                        })
                    }
                }
            },
            loadBase64Font(event) {
                this.canvas.loadFontBase64(event)
            },
            groupSelection: function () {
                if (!this.canvas.getActiveObject()) {
                    return
                }
                if (this.canvas.getActiveObject().type === 'activeSelection') {
                    this.canvas.getActiveObject().toGroup()
                    this.canvas.fire('selection:updated', {
                        target: this.canvas.getActiveObject()
                    })
                    this.canvas.requestRenderAll()
                    return
                }
                if (this.canvas.getActiveObject().type === 'group') {
                    this.canvas.getActiveObject().toActiveSelection()
                    this.canvas.fire('selection:updated', {
                        target: this.canvas.getActiveObject()
                    })
                    this.canvas.requestRenderAll()
                    return
                }
            },
            cloneSelection: function () {
                if (!this.canvas.getActiveObject()) {
                    return
                }
                this.canvas.getActiveObject().clone((cloned) => {
                    cloned.clone((clonedObj) => {
                        this.canvas.discardActiveObject()
                        clonedObj.set({
                            left: clonedObj.left + 50,
                            top: clonedObj.top - 50,
                            evented: true,
                        })
                        if (clonedObj.type === 'activeSelection') {
                            clonedObj.canvas = this.canvas;
                            clonedObj.forEachObject((obj) => {
                                this.canvas.add(obj)
                            });
                            clonedObj.setCoords();
                        } else {
                            this.canvas.add(clonedObj)
                        }
                        cloned.top -= 50;
                        cloned.left += 50;
                        this.canvas.setActiveObject(clonedObj);
                        this.canvas.requestRenderAll();
                    });
                });
            },
            deleteSelection: function () {
                if (!this.canvas.getActiveObject()) {
                    return
                }
                this.canvas.remove(...this.canvas.getActiveObjects())
                this.canvas.discardActiveObject()
                this.canvas.requestRenderAll()
            },
            undo: function () {
                this.canvas.undo()
            },
            redo: function () {
                this.canvas.redo()
            },
            zoomToFit: function () {
                this.canvas.centerPage()
            },
            zoomIn: function () {
                this.canvas.zoomIn()
            },
            zoomOut: function () {
                this.canvas.zoomOut()
            },
            updateRuler: function () {
                let minTickThreshold = 50
                let pxPerCm = this.rulerOptions.pxPerCm * Math.max(this.canvas.minZoom, this.canvas.getZoom())
                if (pxPerCm <= 0 || isNaN(pxPerCm)) pxPerCm = 50
                let leftSteps = Math.ceil(this.canvas.viewportTransform[4] / pxPerCm)
                let rightSteps = Math.ceil(this.canvas.width / pxPerCm - leftSteps)
                let topSteps = Math.ceil(this.canvas.viewportTransform[5] / pxPerCm)
                let bottomSteps = Math.ceil(this.canvas.height / pxPerCm - topSteps)

                this.rulerOptions.w = this.canvas._page ? this.canvas._page.width * this.canvas._page.scaleX * this
                    .canvas.getZoom() : 0
                this.rulerOptions.h = this.canvas._page ? this.canvas._page.height * this.canvas._page.scaleY * this
                    .canvas.getZoom() : 0
                this.rulerOptions.x = this.canvas.viewportTransform[4]
                this.rulerOptions.y = this.canvas.viewportTransform[5]
                this.rulerOptions.pathDataX = ''
                this.rulerOptions.textX = []
                this.rulerOptions.pathDataY = ''
                this.rulerOptions.textY = []
                let diff = (leftSteps + rightSteps) / (this.canvas.width / minTickThreshold)
                let skipTicks = this.canvas.width / (leftSteps + rightSteps) < minTickThreshold ? [2, 2.5, 5, 10,
                    20, 30, 40, 50, 60, 70, 80, 90,
                    100, 110, 120, 130, 140, 150, 200, 250, 300
                ].reduce((prev, curr) => Math.abs(curr - diff) < Math.abs(prev - diff) ? curr : prev) : 1

                if (leftSteps > 0) {
                    for (let i = 0; i <= leftSteps; i += skipTicks) {
                        let posX = this.canvas.viewportTransform[4] - i * pxPerCm
                        this.rulerOptions.pathDataX += ` M ${posX} 3 L ${posX} 18`
                        this.rulerOptions.textX.push({
                            x: posX + 3,
                            content: -i
                        })
                    }
                }
                if (rightSteps > 0) {
                    for (let i = 0; i <= rightSteps; i += skipTicks) {
                        let posX = this.canvas.viewportTransform[4] + i * pxPerCm
                        this.rulerOptions.pathDataX += ` M ${posX} 3 L ${posX} 18`
                        this.rulerOptions.textX.push({
                            x: posX + 3,
                            content: i
                        })
                    }
                }
                if (topSteps > 0) {
                    for (let i = 0; i <= topSteps; i += skipTicks) {
                        let posY = this.canvas.viewportTransform[5] - i * pxPerCm
                        this.rulerOptions.pathDataY += ` M 3 ${posY} L 18 ${posY}`
                        this.rulerOptions.textY.push({
                            y: posY + 3,
                            content: -i
                        })
                    }
                }
                if (bottomSteps > 0) {
                    for (let i = 0; i <= bottomSteps; i += skipTicks) {
                        let posY = this.canvas.viewportTransform[5] + i * pxPerCm
                        this.rulerOptions.pathDataY += ` M 3 ${posY} L 18 ${posY}`
                        this.rulerOptions.textY.push({
                            y: posY + 3,
                            content: i
                        })
                    }
                }
            },
            sliderZoom: function (value) {
                if (this.canvas) {
                    this.canvas.zoomTo(value / 100)
                }
            },
            helpEditor: function () {
                if (window.parent) {
                    window.parent.postMessage({
                        help: true
                    }, '*')
                }
            },
            closeEditor: function () {
                if (window.parent) {
                    window.parent.postMessage({
                        close: true
                    }, '*')
                }
            },
            previewEditor: function () {
                if (window.parent) {
                    window.parent.postMessage({
                        preview: true,
                        previewPage: this.activePage
                    }, '*')
                }
            },
            exportDrawing: function () {
                if (typeof this.activePage === 'number' && this.pages[this.activePage]) {
                    this.pages[this.activePage].json = this.canvas.toJSON(['evented', 'role',
                        'selectable'
                    ])
                }
                fetch('http://localhost:3000/api/svg', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        page: this.pages[0].json
                    })
                }).then(response => response.text()).then(text => {
                    let svgBlob = new Blob([text], {
                        type: 'image/svg+xml;charset=utf-8'
                    })
                    let svgUrl = URL.createObjectURL(svgBlob)
                    let downloadLink = document.createElement('a')
                    downloadLink.href = svgUrl
                    downloadLink.download = 'export.svg'
                    document.body.appendChild(downloadLink)
                    downloadLink.click()
                    document.body.removeChild(downloadLink)
                })
                if (window.parent) {
                    window.parent.postMessage({
                        pages: this.pages
                    }, '*')
                }
            },
            getBase64(file) {
                return new Promise(function (resolve, reject) {
                    let reader = new FileReader();
                    let imgResult = "";
                    reader.readAsDataURL(file);
                    reader.onload = function () {
                        imgResult = reader.result;
                    };
                    reader.onerror = function (error) {
                        reject(error);
                    };
                    reader.onloadend = function () {
                        resolve(imgResult);
                    };
                });
            },
            addClipart: function (url, event) {
                this.canvas.addClipart(url)
                console.log(event)
                event.preventDefault()
            },
            uploadImageBase64: function (file) {
                this.getBase64(file).then(res => {
                    this.canvas.addImage(res)
                })
            },
            uploadSvgBase64: function (file) {
                this.getBase64(file).then(res => {
                    this.canvas.addSvg(res)
                })
            },
            addCircle: function () {
                this.canvas.addCircle()
            },
            addTriangle: function () {
                this.canvas.addTriangle()
            },
            addRect: function () {
                this.canvas.addRect()
            },
            addEllipse: function () {
                this.canvas.addEllipse()
            },
            addText: function (options) {
                this.canvas.addText(options)
            },
            setLayer: function (layer) {
                this.canvas.positionActiveObject(layer)
                this.canvas.requestRenderAll()
            },
            setAlign: function (align) {
                this.canvas.alignActiveObject(align)
                this.canvas.requestRenderAll()
            },
            setStyle: function (style) {
                if (!this.activeSelection) return
                for (const property in style) {
                    if (style[property] === null) {
                        delete style[property]
                    }
                }
                this.canvas.getActiveObject().set(style)
                if (this.canvas.getMissingFonts().length > 0 && style.fontFamily) {
                    this.canvas.fire('missing:fonts', this.canvas.getMissingFonts())
                }
                this.canvas.fire('object:modified', {
                    target: this.canvas.getActiveObject()
                })
                this.canvas.requestRenderAll()
            },
            setGrid: function () {
                this.canvas.grid = this.grid
                this.canvas.requestRenderAll()
            },
            setGridSize: function (value) {
                this.gridSize = Number(value)
                this.canvas.gridSize = this.gridSize
                this.canvas.requestRenderAll()
            },
            navMenu: function (tab) {
                this.tab = this.tab === tab ? null : tab
                if (this.canvas) {
                    this.canvas.discardActiveObject()
                    this.canvas.requestRenderAll()
                }
            }
        },
        mounted() {
            this.loading = false
            this.canvas = new fabric.Canvas('canvas', {
                fireMiddleClick: true,
                skipOffscreen: true,
                preserveObjectStacking: true
            })
            this.canvas.loadDefaultFont()
            setInterval(() => {
                this.canvas.renderCanvas(this.canvas.contextContainer, this.canvas._objects)
            }, 250)
            this.canvas.initKeyEvents()
            this.canvas.on('object:modified', (selection) => {
                this.activeSelection = typeof selection.target.getUIStyles ==
                    'function' ? selection
                    .target.getUIStyles() : selection.target
            })
            this.canvas.on('selection:created', (selection) => {
                this.activeSelection = typeof selection.target.getUIStyles ==
                    'function' ? selection
                    .target.getUIStyles() : selection.target
                if (!this.tab) {
                    this.tab = this.canvas.getTab(selection.target)
                }
            })
            this.canvas.on('selection:updated', (selection) => {
                this.activeSelection = typeof selection.target.getUIStyles ==
                    'function' ? selection
                    .target.getUIStyles() : selection.target
                if (!this.tab) {
                    this.tab = this.canvas.getTab(selection.target)
                }
            })
            this.canvas.on('text:selection:changed', (selection) => {
                this.activeSelection = typeof selection.target.getUIStyles ==
                    'function' ? selection
                    .target.getUIStyles() : selection.target
                if (!this.tab) {
                    this.tab = this.canvas.getTab(selection.target)
                }
            })
            this.canvas.on('selection:cleared', () => {
                this.activeSelection = null
            })
            this.canvas.on('zoom:changed', () => {
                this.zoom = Number((this.canvas.getZoom() * 100).toFixed(0))
                this.updateRuler()
            })
            this.canvas.on('missing:fonts', (fonts) => {
                fonts.forEach(mFont => {
                    let fontMatch = this.fonts.filter(font => font.name === mFont)[0]
                    if (fontMatch) {
                        let url = fontMatch.url
                        fetch(`${this.hostUrl}/${url}`).then((response) => {
                            return response.arrayBuffer()
                        }).then((buffer) => {
                            this.canvas.loadFont(buffer, mFont)
                        })
                    }
                })
            })
            this.canvas.initResponsive(document.getElementsByClassName('canvas-wrapper')[0])
            this.addPage({
                width: 595,
                height: 842,
                fill: '#ffffff',
                name: ''
            })

            window.addEventListener('message', (event) => {
                if (event.origin !== window.location.origin) {
                    if (event.data) {
                        let data = event.data
                        this.canvas.clear()
                        this.activePage = null
                        if (data.pages) {
                            this.pages = data.pages
                            this.loadedFonts.then(() => {
                                this.setPage(0)
                            })
                        }
                        if (data.css) {
                            // we expect it's name without extension
                            fetch(`${this.hostUrl}/${data.css}.css`).then((response) => {
                                return response.text()
                            }).then((result) => {
                                let style = document.createElement('style')
                                style.innerText = result
                                document.head.appendChild(style)
                            })
                        }
                        if (data.language) {
                            // we expect it's name without extension
                            fetch(`${this.hostUrl}/${data.language}.json`).then((response) => {
                                return response.json()
                            }).then((result) => {
                                this.language = result
                            })
                        }
                        if (data.pxPerCm) {
                            this.rulerOptions.pxPerCm = Number(data.pxPerCm)
                        }
                        if (data.units) {
                            this.rulerOptions.units = data.units
                        }
                        if (data.objectStatus) {
                            this.objectStatus = data.objectStatus
                        }
                        if (data.logo) {
                            this.logo = data.logo
                        }
                    }
                }
            }, false)

            fetch(`${this.hostUrl}/api/cliparts`).then((response) => {
                return response.json()
            }).then((result) => {
                this.cliparts = result
            })
            this.loadedFonts = new Promise((resolve) => {
                fetch(`${this.hostUrl}/api/fonts`).then((response) => {
                    return response.json()
                }).then((result) => {
                    if (Array.isArray(result)) {
                        result.forEach(family => {
                            this.fonts.push(...family.fonts)
                        })
                    }
                    resolve()
                })
            })
        }
    }
</script>

<style>
    .editor {
        background: #1e2024;
    }

    .container {
        display: flex;
        flex-direction: row;
        height: 100vh;
    }

    .canvas-wrapper {
        flex: 1;
        width: 100%;
        height: 100%;
        overflow: hidden;
    }

    .menu {
        flex: 0 0 50px;
        background: #3f414c;
        box-shadow: 0 0 0.26rem rgba(30, 32, 36, .8);
        color: #73757C;
        display: flex;
        flex-direction: column;
        justify-content: flex-start;
        z-index: 102;
        user-select: none;
    }

    .menu div {
        display: flex;
        justify-content: center;
        align-content: center;
        width: 100%;
        height: 50px;
        font-size: 20pt;
        cursor: pointer;
        transition: all .15s ease-in-out;
    }

    .menu div>svg {
        width: 28px;
        height: auto;
    }

    .menu div:hover {
        color: #EDEDED;
    }

    .menu .active {
        color: #EDEDED;
    }

    .menu-tab {
        display: flex;
        flex-direction: column;
        align-items: center;
        position: absolute;
        top: 0;
        left: 50px;
        max-width: 290px;
        width: 100%;
        height: 100vh;
        color: #b6b6b6;
        background: #2d2e37;
        z-index: 101;
        user-select: none;
        overflow-y: auto;
        overflow-x: hidden;
    }

    .export {
        position: absolute;
        z-index: 100;
        right: 25px;
        top: 60px;
    }

    .zoom {
        position: absolute;
        z-index: 100;
        right: 0;
        bottom: 2vh;
        display: flex;
        flex-direction: row;
        justify-content: center;
        width: calc(100vw - 50px);
    }

    .pages-menu {
        position: absolute;
        z-index: 100;
        right: 0;
        bottom: calc(2vh + 50px);
        display: flex;
        flex-direction: row;
        justify-content: center;
        width: calc(100vw - 50px);
    }

    .tab {
        padding: 20px 20px 0px 20px;
        display: flex;
        flex-direction: column;
        width: calc(100% - 40px);
    }

    .shapes-container-div svg {
        cursor: pointer;
        transition: all .15s ease-in-out;
    }

    .shapes-container-div svg:hover {
        opacity: 0.8;
    }

    .page-item {
        width: 100%;
        max-width: 90px;
        height: 100px;
        background: #fff;
        margin-bottom: 20px;
        outline: 2px solid transparent;
        cursor: pointer;
    }

    .page-content {
        display: flex;
        justify-content: center;
        align-items: center;
        color: #1e2024;
        height: 100%;
        width: 100%;
    }

    .active-page {
        outline: 2px solid #0BAB64;
    }

    .el-color-dropdown__btns button:last-child {
        color: #FFF;
        background-color: #0BAB64;
        border-color: #0BAB64
    }

    .el-color-dropdown__btns button:last-child:hover {
        background-color: #0BAB64;
        border-color: #0BAB64;
        opacity: 0.7;
        color: #FFF
    }

    .el-color-dropdown__btns button:last-child:focus {
        background-color: #0BAB64;
        border-color: #0BAB64;
        opacity: 0.7;
        color: #FFF
    }

    .clipart-image {
        cursor: pointer;
    }

    .clipart-image:hover {
        opacity: 0.7;
    }

    .font-item {
        height: 50px;
        display: flex;
        align-items: center;
        cursor: pointer;
    }

    .font-item:hover {
        color: #fff;
    }

    .font-item svg {
        width: 100%;
        height: auto;
    }

    .close-fonts {
        cursor: pointer;
        font-size: 14pt;
    }

    .close-fonts:hover {
        opacity: 0.7;
    }

    .font-select {
        max-width: 100%;
        overflow: hidden;
        text-align: right;
        font-size: 10pt;
        cursor: pointer;
        color: #EDEDED;
        white-space: nowrap;
    }

    .font-select:hover {
        color: #fff;
    }

    .fonts-dialog {
        width: 100%;
        color: #b6b6b6;
        background: #2d2e37;
        z-index: 1100;
        position: absolute;
    }

    .fonts-dialog-header {
        width: calc(100%-20px);
        height: 30px;
        display: flex;
        padding-right: 20px;
        padding-top: 10px;
        justify-content: flex-end;
        align-items: center;
    }

    .fonts-dialog-items {
        width: calc(100% - 40px);
        height: calc(100vh - 40px);
        overflow-y: auto;
        padding: 0px 20px 0px 20px;
    }

    .ruler-units {
        position: absolute;
        z-index: 100;
        right: 20px;
        top: 20px;
        color: #fff;
        font-size: 14pt;
    }

    .object-status {
        position: absolute;
        z-index: 100;
        bottom: 100px;
        right: 20px;
        color: #fff;
        font-size: 14pt;
    }

    .editor-logo {
        position: absolute;
        z-index: 100;
        left: 100px;
        top: 50px;
        max-width: 150px;
    }

    .editor-logo img {
        width: 100%;
        height: auto;
        user-select: none;
    }
</style>