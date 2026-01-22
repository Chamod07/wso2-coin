// Copyright (c) 2025 WSO2 LLC. (https://www.wso2.com).
//
// WSO2 LLC. licenses this file to you under the Apache License,
// Version 2.0 (the "License"); you may not use this file except
// in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing,
// software distributed under the License is distributed on an
// "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
// KIND, either express or implied.  See the License for the
// specific language governing permissions and limitations
// under the License.
import { createApi } from "@reduxjs/toolkit/query/react";

import { ConferenceQrCodesResponse, CreateQrCodePayload } from "@/types/types";
import { AppConfig } from "@config/config";

import { baseQueryWithRetry } from "./BaseQuery";

export const qrApi = createApi({
  reducerPath: "qrApi",
  baseQuery: baseQueryWithRetry,
  tagTypes: ["QR"],
  endpoints: (builder) => ({
    fetchQrCodes: builder.query<ConferenceQrCodesResponse, { limit?: number; offset?: number }>({
      query: (params) => {
        const queryParams = new URLSearchParams();
        if (params.limit) queryParams.append("limit", params.limit.toString());
        if (params.offset) queryParams.append("offset", params.offset.toString());
        return `${AppConfig.serviceUrls.qrCodes}?${queryParams.toString()}`;
      },
      providesTags: ["QR"],
    }),
    createQrCode: builder.mutation<{ qrId: string }, CreateQrCodePayload>({
      query: (payload) => ({
        url: AppConfig.serviceUrls.qrCodes,
        method: "POST",
        body: payload,
      }),
      invalidatesTags: ["QR"],
    }),
    deleteQrCode: builder.mutation<void, string>({
      query: (qrId) => ({
        url: `${AppConfig.serviceUrls.qrCodes}/${qrId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["QR"],
    }),
  }),
});

export const { useFetchQrCodesQuery, useCreateQrCodeMutation, useDeleteQrCodeMutation } = qrApi;
