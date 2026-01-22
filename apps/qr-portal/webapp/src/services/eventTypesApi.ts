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

import { ConferenceEventType } from "@/types/types";
import { AppConfig } from "@config/config";

import { baseQueryWithRetry } from "./BaseQuery";

export const eventTypesApi = createApi({
  reducerPath: "eventTypesApi",
  baseQuery: baseQueryWithRetry,
  tagTypes: ["EventType"],
  endpoints: (builder) => ({
    fetchEventTypes: builder.query<ConferenceEventType[], void>({
      query: () => AppConfig.serviceUrls.eventTypes,
      providesTags: ["EventType"],
    }),
    createEventType: builder.mutation<
      ConferenceEventType,
      Omit<ConferenceEventType, "eventTypeName"> & { eventTypeName: string }
    >({
      query: (eventType) => ({
        url: AppConfig.serviceUrls.eventTypes,
        method: "POST",
        body: eventType,
      }),
      invalidatesTags: ["EventType"],
    }),
    updateEventType: builder.mutation<
      ConferenceEventType,
      { eventTypeName: string; description?: string; defaultCoins?: number }
    >({
      query: ({ eventTypeName, ...patch }) => ({
        url: `${AppConfig.serviceUrls.eventTypes}/${encodeURIComponent(eventTypeName)}`,
        method: "PUT",
        body: patch,
      }),
      async onQueryStarted({ eventTypeName, ...patch }, { dispatch, queryFulfilled, getState }) {
        try {
          // Get the current event type from cache to preserve category
          const state = getState() as any;
          const currentEventTypes = eventTypesApi.endpoints.fetchEventTypes.select()(state);
          const currentEventType = currentEventTypes.data?.find(
            (et: ConferenceEventType) => et.eventTypeName === eventTypeName,
          );

          if (!currentEventType) {
            throw new Error("Event type not found");
          }

          // Build the update payload with all required fields
          const updatePayload: ConferenceEventType = {
            eventTypeName,
            category: currentEventType.category,
            description:
              patch.description !== undefined ? patch.description : currentEventType.description,
            defaultCoins:
              patch.defaultCoins !== undefined ? patch.defaultCoins : currentEventType.defaultCoins,
          };

          // Wait for the query to complete
          await queryFulfilled;

          // Update the cache manually since we're modifying the body
          dispatch(
            eventTypesApi.util.updateQueryData("fetchEventTypes", undefined, (draft) => {
              const index = draft.findIndex((et) => et.eventTypeName === eventTypeName);
              if (index !== -1) {
                draft[index] = updatePayload;
              }
            }),
          );
        } catch (error) {
          // Handle error if needed
          console.error("Error updating event type:", error);
        }
      },
      invalidatesTags: ["EventType"],
    }),
    deleteEventType: builder.mutation<void, string>({
      query: (eventTypeName) => ({
        url: `${AppConfig.serviceUrls.eventTypes}/${encodeURIComponent(eventTypeName)}`,
        method: "DELETE",
      }),
      invalidatesTags: ["EventType"],
    }),
  }),
});

export const {
  useFetchEventTypesQuery,
  useCreateEventTypeMutation,
  useUpdateEventTypeMutation,
  useDeleteEventTypeMutation,
} = eventTypesApi;
